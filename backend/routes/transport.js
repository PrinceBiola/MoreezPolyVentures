import express from 'express';
import Car from '../models/Car.js';
import Expense from '../models/Expense.js';
import Payment from '../models/Payment.js';
import { notificationService } from '../services/notificationService.js';

const router = express.Router();

// ... existing routes ...

// Get all payments
router.get('/payments', async (req, res) => {
  const { startDate, endDate, carId } = req.query;
  let query = { status: 'Active' };
  
  if (carId) query.carId = carId;
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }
  
  try {
    const payments = await Payment.find(query).populate('carId').sort({ date: -1 }).lean();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a payment
router.put('/payments/:id', async (req, res) => {
  try {
    const updatedPayment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedPayment) return res.status(404).json({ message: 'Payment not found' });
    res.json(updatedPayment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add a payment
router.post('/payments', async (req, res) => {
  try {
    const paymentData = { ...req.body };
    
    // Auto-populate driver if missing but carId is present
    if (!paymentData.driver && paymentData.carId) {
      const car = await Car.findById(paymentData.carId);
      if (car) {
        paymentData.driver = car.driverName;
      }
    }

    const payment = new Payment(paymentData);
    const newPayment = await payment.save();

    // Notify on payment record
    await notificationService.createNotification(
      'Payment Recorded',
      `₦${newPayment.amount.toLocaleString()} received from ${newPayment.driver} (${newPayment.plateNumber || 'Fleet'}).`,
      'success',
      'finance'
    );

    res.status(201).json(newPayment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all cars
router.get('/cars', async (req, res) => {
  const { search } = req.query;
  let query = { status: { $ne: 'Deactivated' } };

  if (search) {
    query.$or = [
      { plateNumber: { $regex: search, $options: 'i' } },
      { model: { $regex: search, $options: 'i' } },
      { driverName: { $regex: search, $options: 'i' } }
    ];
  }

  try {
    const cars = await Car.find(query).lean();
    res.json(cars);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a car
router.post('/cars', async (req, res) => {
  try {
    const car = new Car(req.body);
    const newCar = await car.save();

    // Notify on new vehicle registration
    await notificationService.createNotification(
      'Vehicle Registered',
      `${newCar.plateNumber} (${newCar.model}) has been added to the fleet.`,
      'success',
      'transport'
    );

    res.status(201).json(newCar);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all expenses
router.get('/expenses', async (req, res) => {
  const { startDate, endDate, carId, category } = req.query;
  let query = { status: 'Active' };

  if (carId) query.carId = carId;
  if (category && category !== 'All') query.category = category;

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }
  try {
    const expenses = await Expense.find(query).populate('carId').sort({ date: -1 }).lean();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update an expense
router.put('/expenses/:id', async (req, res) => {
  try {
    const updatedExpense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedExpense) return res.status(404).json({ message: 'Expense not found' });
    res.json(updatedExpense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add an expense
router.post('/expenses', async (req, res) => {
  try {
    const expense = new Expense(req.body);
    const newExpense = await expense.save();

    // Notify on expense record
    await notificationService.createNotification(
      'Expense Logged',
      `₦${newExpense.amount.toLocaleString()} logged for ${newExpense.category} (${newExpense.plateNumber || 'Fleet'}).`,
      'warning',
      'transport'
    );

    res.status(201).json(newExpense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get single car details
router.get('/cars/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });
    
    // Fetch related data for the car detail view (only active ones)
    const [payments, expenses] = await Promise.all([
      Payment.find({ carId: req.params.id, status: 'Active' }).sort({ date: -1 }).lean(),
      Expense.find({ carId: req.params.id, status: 'Active' }).sort({ date: -1 }).lean()
    ]);
    
    res.json({ ...car.toObject(), payments, expenses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a car
router.put('/cars/:id', async (req, res) => {
  try {
    const updatedCar = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedCar) return res.status(404).json({ message: 'Car not found' });
    res.json(updatedCar);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Deactivate a car (Soft Delete)
router.delete('/cars/:id', async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(req.params.id, { status: 'Deactivated' }, { new: true });
    if (!car) return res.status(404).json({ message: 'Car not found' });
    res.json({ message: 'Car deactivated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Void an expense (Soft Delete)
router.delete('/expenses/:id', async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, { status: 'Voided' }, { new: true });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense record voided' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Void a payment (Soft Delete)
router.delete('/payments/:id', async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, { status: 'Voided' }, { new: true });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json({ message: 'Payment record voided' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
