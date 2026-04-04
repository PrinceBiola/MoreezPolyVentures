import express from 'express';
import Product from '../models/Product.js';
import Sale from '../models/Sale.js';
import Purchase from '../models/Purchase.js';
import Expense from '../models/Expense.js';
import { notificationService } from '../services/notificationService.js';

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ status: { $ne: 'Inactive' } }).lean();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add product
router.post('/', async (req, res) => {
  try {
    const existingProduct = await Product.findOne({ 
      name: { $regex: new RegExp(`^${req.body.name}$`, 'i') }, 
      status: { $ne: 'Inactive' } 
    });
    
    if (existingProduct) {
      return res.status(400).json({ message: `An active product named "${req.body.name}" already exists. Please use a different name or edit the existing one.` });
    }

    const product = new Product(req.body);
    // Explicitly set currentStock to openingBal for new product creation, ensuring it's a Number
    const openingBal = Number(req.body.openingBal || 0);
    product.openingBal = openingBal;
    product.currentStock = openingBal;
    const newProduct = await product.save();
    
    // Notify on new product integration
    await notificationService.createNotification(
      'New Product Catalogued',
      `${newProduct.name} has been added to the inventory.`,
      'success',
      'inventory'
    );

    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update product details
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    // Update fields (excluding currentStock which is handled via Purchases/Sales)
    const { currentStock, ...updateData } = req.body;
    Object.assign(product, updateData);
    
    // Recalculate status based on numeric stock
    const stock = Number(product.currentStock || 0);
    const reorder = Number(product.reorderLevel || 5);
    product.status = stock <= reorder ? 'Reorder' : (stock === 0 ? 'Out of Stock' : 'In Stock');
    
    await product.save();
    
    // Check for low stock on update
    await notificationService.checkStock(product);

    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Deactivate a product (Soft Delete)
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    const newName = `${product.name} (Archived - ${Math.floor(1000 + Math.random() * 9000)})`;
    product.name = newName;
    product.status = 'Inactive';
    
    const updatedProduct = await product.save();
    if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
    
    // Check for low stock on update
    await notificationService.checkStock(updatedProduct);

    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Record a Purchase
router.post('/purchases', async (req, res) => {
  const { date, productId, quantityPurchased, costPerBag } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const qtyKg = quantityPurchased * (product.weightKg || 1);
    const purchase = new Purchase({ date, productId, quantityPurchased, qtyKg, costPerBag });
    
    // Update stock numerically
    const currentStock = Number(product.currentStock || 0);
    const addedStock = Number(quantityPurchased || 0);
    product.currentStock = currentStock + addedStock;
    
    product.status = product.currentStock <= (product.reorderLevel || 5) ? 'Reorder' : 'In Stock';
    await product.save();

    // Check stock after purchase
    await notificationService.checkStock(product);

    const newPurchase = await purchase.save();
    res.status(201).json(newPurchase);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all purchases
router.get('/purchases', async (req, res) => {
  const { startDate, endDate, productId } = req.query;
  let query = { status: 'Active' };
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date.$lte = end;
    }
  }

  if (productId) {
    query.productId = productId;
  }

  try {
    const purchases = await Purchase.find(query)
      .populate('productId')
      .sort({ date: -1 })
      .lean();
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Record a Sale (Multi-item)
router.post('/sales', async (req, res) => {
  const { date, customerName, items } = req.body;
  try {
    let totalAmount = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        // If product not found, skip this item but don't fail the whole sale
        console.warn(`Product with ID ${item.productId} not found for sale.`);
        continue;
      }

      // Check if enough stock is available
      if (product.currentStock < Number(item.quantitySold)) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}. Available: ${product.currentStock}, Requested: ${item.quantitySold}` });
      }

      const qtyKg = item.quantitySold * (product.weightKg || 1);
      processedItems.push({
        productId: item.productId,
        quantitySold: Number(item.quantitySold),
        qtyKg,
        salesPrice: Number(item.salesPrice)
      });

      totalAmount += Number(item.quantitySold) * Number(item.salesPrice);

      // Update stock numerically
      const currentStock = Number(product.currentStock || 0);
      const soldStock = Number(item.quantitySold || 0);
      product.currentStock = currentStock - soldStock;
      
      product.status = product.currentStock <= (product.reorderLevel || 5) ? 'Reorder' : 'In Stock';
      await product.save();
    }

    const sale = new Sale({ date, customerName, items: processedItems, totalAmount });
    const newSale = await sale.save();

    // Post-sale stock check for each item
    for (const item of newSale.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        await notificationService.checkStock(product);
      }
    }

    // Record system notification
    await notificationService.createNotification(
      'Transaction Recorded',
      `New sale processed for ₦${newSale.totalAmount.toLocaleString()}.`,
      'success',
      'finance'
    );

    res.status(201).json(newSale);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all sales
router.get('/sales', async (req, res) => {
  const { startDate, endDate, customerName } = req.query;
  let query = { status: 'Active' };

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date.$lte = end;
    }
  }

  if (customerName) {
    query.customerName = { $regex: customerName, $options: 'i' };
  }

  try {
    const sales = await Sale.find(query)
      .populate('items.productId')
      .sort({ date: -1 })
      .lean();
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get reports
router.get('/reports/summary', async (req, res) => {
  try {
    const totalSales = await Sale.aggregate([
      { $match: { status: 'Active' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalPurchases = await Purchase.aggregate([
      { $match: { status: 'Active' } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$quantityPurchased', '$costPerBag'] } } } }
    ]);
    res.json({
      sales: totalSales[0]?.total || 0,
      purchases: totalPurchases[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Void a Sale (Soft Delete)
router.delete('/sales/:id', async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });

    if (sale.status === 'Voided') return res.status(400).json({ message: 'Sale already voided' });

    // Revert stock changes
    for (const item of sale.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.currentStock += Number(item.quantitySold);
        product.status = product.currentStock <= product.reorderLevel ? 'Reorder' : 'In Stock';
        await product.save();
      }
    }

    sale.status = 'Voided';
    await sale.save();
    res.json({ message: 'Sale record voided and stock reverted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Void a Purchase (Soft Delete)
router.delete('/purchases/:id', async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) return res.status(404).json({ message: 'Purchase not found' });

    if (purchase.status === 'Voided') return res.status(400).json({ message: 'Purchase already voided' });

    // Revert stock changes
    const product = await Product.findById(purchase.productId);
    if (product) {
      product.currentStock -= Number(purchase.quantityPurchased);
      product.status = product.currentStock <= product.reorderLevel ? 'Reorder' : 'In Stock';
      await product.save();
    }

    purchase.status = 'Voided';
    await purchase.save();
    res.json({ message: 'Purchase record voided and stock reverted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all business expenses
router.get('/expenses', async (req, res) => {
  const { startDate, endDate, category } = req.query;
  let query = { status: 'Active', expenseType: 'Business' };

  if (category && category !== 'All') query.category = category;

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }
  try {
    const expenses = await Expense.find(query).sort({ date: -1 }).lean();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a business expense
router.post('/expenses', async (req, res) => {
  try {
    const expenseData = { ...req.body, expenseType: 'Business' };
    const expense = new Expense(expenseData);
    const newExpense = await expense.save();

    // Notify on expense record
    await notificationService.createNotification(
      'Business Expense Logged',
      `₦${newExpense.amount.toLocaleString()} logged for ${newExpense.category}.`,
      'warning',
      'finance'
    );

    res.status(201).json(newExpense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a business expense
router.put('/expenses/:id', async (req, res) => {
  try {
    const updatedExpense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedExpense) return res.status(404).json({ message: 'Expense not found' });
    res.json(updatedExpense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Void a business expense (Soft Delete)
router.delete('/expenses/:id', async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, { status: 'Voided' }, { new: true });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense record voided' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
