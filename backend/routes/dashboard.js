import express from 'express';
const router = express.Router();
import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Car from '../models/Car.js';
import Payment from '../models/Payment.js';
import Expense from '../models/Expense.js';

router.get('/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Create date filter object
    let dateFilter = { status: 'Active' };
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      };
    }

    const paymentDateFilter = { 
      status: 'Active',
      ...(startDate && endDate && {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
        }
      })
    };

    const expenseDateFilter = { 
      status: 'Active',
      ...(startDate && endDate && {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
        }
      })
    };

    const [
      salesStats,
      paymentStats,
      businessExpenseStats,
      transportExpenseStats,
      productStats,
      carStats,
      recentSales,
      recentExpenses
    ] = await Promise.all([
      Sale.find(dateFilter).populate('items.productId').lean(),
      Payment.aggregate([
        { $match: paymentDateFilter },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Expense.aggregate([
        { $match: { ...expenseDateFilter, expenseType: 'Business' } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Expense.aggregate([
        { $match: { ...expenseDateFilter, expenseType: { $ne: 'Business' } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Product.aggregate([
        { $group: { _id: null, totalStockValue: { $sum: { $multiply: ["$currentStock", "$costPrice"] } } } }
      ]),
      Car.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      Sale.find(dateFilter).sort({ createdAt: -1 }).limit(5).lean(),
      Expense.find(expenseDateFilter).sort({ date: -1 }).limit(5).lean()
    ]);

    // Calculate Sales and COGS from populated sales
    const businessRevenue = salesStats.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
    const businessCOGS = salesStats.reduce((acc, sale) => {
      const saleCOGS = (sale.items || []).reduce((itemAcc, item) => {
        const cost = item.productId?.costPrice || 0;
        // Use qtyKg if available (since costPrice is per kg), fallback to quantitySold
        const actualQuantity = item.qtyKg || item.quantitySold || 0;
        return itemAcc + (Number(actualQuantity) * cost);
      }, 0);
      return acc + saleCOGS;
    }, 0);

    const businessExpenses = businessExpenseStats[0]?.total || 0;
    const businessNetProfit = businessRevenue - businessCOGS - businessExpenses;

    const transportIncome = paymentStats[0]?.total || 0;
    const transportExpenses = transportExpenseStats[0]?.total || 0;
    const transportNetProfit = transportIncome - transportExpenses;
    
    const stockValue = productStats[0]?.totalStockValue || 0;
    const globalNetProfit = businessNetProfit + transportNetProfit;

    const metrics = {
      businessRevenue,
      businessCOGS,
      businessExpenses,
      businessNetProfit,
      transportIncome,
      transportExpenses,
      transportNetProfit,
      globalNetProfit,
      stockValue
    };

    const fleet = {
      total: carStats.reduce((acc, curr) => acc + curr.count, 0),
      active: carStats.find(c => c._id === 'Active')?.count || 0,
      repairing: carStats.find(c => c._id === 'Maintenance')?.count || 0,
      offline: carStats.filter(c => ['Impounded', 'In Transit', 'Deactivated'].includes(c._id))
                       .reduce((acc, curr) => acc + curr.count, 0)
    };

    // Cashflow Mock Data (kept as is for frontend consistency)
    const cashFlow = [
      { name: 'May', businessRevenue: businessRevenue * 0.1, transportRevenue: transportIncome * 0.1, totalExpenses: (businessExpenses + transportExpenses) * 0.12 },
      { name: 'Jun', businessRevenue: businessRevenue * 0.15, transportRevenue: transportIncome * 0.15, totalExpenses: (businessExpenses + transportExpenses) * 0.1 },
      { name: 'Jul', businessRevenue: businessRevenue * 0.25, transportRevenue: transportIncome * 0.25, totalExpenses: (businessExpenses + transportExpenses) * 0.2 },
      { name: 'Aug', businessRevenue: businessRevenue * 0.5, transportRevenue: transportIncome * 0.5, totalExpenses: (businessExpenses + transportExpenses) * 0.58 }, 
    ];

    res.json({
      metrics,
      fleet,
      recentSales,
      recentExpenses,
      cashFlow
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ products: [], vehicles: [], sales: [] });

    const regex = new RegExp(q, 'i');

    const [products, vehicles, sales] = await Promise.all([
      Product.find({ name: regex }).select('name currentStock grade').limit(5).lean(),
      Car.find({ $or: [{ plateNumber: regex }, { driverName: regex }] }).select('plateNumber model driverName status').limit(5).lean(),
      Sale.find({ customerName: regex }).select('customerName totalAmount date').limit(5).lean()
    ]);

    res.json({ products, vehicles, sales });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
