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
      expenseStats,
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
        { $match: expenseDateFilter },
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
    const totalSales = salesStats.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
    const businessCOGS = salesStats.reduce((acc, sale) => {
      const saleCOGS = (sale.items || []).reduce((itemAcc, item) => {
        const cost = item.productId?.costPrice || 0;
        return itemAcc + (Number(item.quantitySold || 0) * cost);
      }, 0);
      return acc + saleCOGS;
    }, 0);

    const transportIncome = paymentStats[0]?.total || 0;
    const transportExpenses = expenseStats[0]?.total || 0;
    const stockValue = productStats[0]?.totalStockValue || 0;
    
    const totalExpenses = transportExpenses; 
    const netProfit = (totalSales - businessCOGS) + (transportIncome - transportExpenses);

    const metrics = {
      totalSales,
      totalExpenses,
      netProfit,
      transportIncome
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
      { name: 'May', sales: totalSales * 0.1, expenses: totalExpenses * 0.12 },
      { name: 'Jun', sales: totalSales * 0.15, expenses: totalExpenses * 0.1 },
      { name: 'Jul', sales: totalSales * 0.25, expenses: totalExpenses * 0.2 },
      { name: 'Aug', sales: totalSales * 0.5, expenses: totalExpenses * 0.58 }, 
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

export default router;
