import express from 'express';
import Debt from '../models/Debt.js';

const router = express.Router();

// GET all debts (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { type, status, search } = req.query;
    let query = {};

    if (type) query.type = type;
    if (status) {
      if (status === 'Active') {
        query.status = { $in: ['Pending', 'Partially Paid'] };
      } else {
        query.status = status;
      }
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const debts = await Debt.find(query).sort({ date: -1 });
    res.json({ success: true, count: debts.length, data: debts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create a new debt record
router.post('/', async (req, res) => {
  try {
    const { type, name, amount, description, date, dueDate, status } = req.body;

    if (!type || !name || !amount) {
      return res.status(400).json({ success: false, message: 'Type, Name, and Amount are required.' });
    }

    const debt = new Debt({
      type,
      name,
      amount,
      description,
      date,
      dueDate,
      status: status || 'Pending'
    });

    const savedDebt = await debt.save();
    res.status(201).json({ success: true, data: savedDebt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH toggle settlement status
router.patch('/:id/settle', async (req, res) => {
  try {
    const debt = await Debt.findById(req.params.id);
    if (!debt) {
      return res.status(404).json({ success: false, message: 'Debt record not found.' });
    }

    if (debt.status !== 'Settled') {
      const remaining = debt.amount - (debt.amountPaid || 0);
      if (remaining > 0) {
         debt.paymentHistory.push({
           amount: remaining,
           date: new Date(),
           note: 'Full Settlement via Quick Button'
         });
      }
      debt.status = 'Settled';
      debt.amountPaid = debt.amount;
    } else {
      // If toggling back to pending, reset it
      debt.status = 'Pending';
      debt.amountPaid = 0;
      debt.paymentHistory = [];
    }

    const updatedDebt = await debt.save();
    res.json({ success: true, data: updatedDebt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST record a partial/full payment
router.post('/:id/payments', async (req, res) => {
  try {
    const { amount, note, date } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid payment amount is required.' });
    }

    const debt = await Debt.findById(req.params.id);
    if (!debt) {
      return res.status(404).json({ success: false, message: 'Debt record not found.' });
    }

    debt.amountPaid = (debt.amountPaid || 0) + Number(amount);
    debt.paymentHistory.push({
      amount: Number(amount),
      date: date ? new Date(date) : new Date(),
      note: note || ''
    });

    if (debt.amountPaid >= debt.amount) {
      debt.status = 'Settled';
      // cap it to prevent overpayment representation error if needed, but lets just trust the input
    } else if (debt.amountPaid > 0) {
      debt.status = 'Partially Paid';
    } else {
      debt.status = 'Pending';
    }

    const updatedDebt = await debt.save();
    res.json({ success: true, data: updatedDebt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE a debt record
router.delete('/:id', async (req, res) => {
  try {
    const debt = await Debt.findById(req.params.id);
    if (!debt) {
      return res.status(404).json({ success: false, message: 'Debt record not found.' });
    }

    await Debt.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Record removed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
