import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  category: { type: String, required: true },
  description: { type: String },
  amount: { type: Number, required: true },
  carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' }, // Optional for transport
  expenseType: { type: String, enum: ['Transport', 'Business'], default: 'Transport' },
  status: { type: String, default: 'Active', index: true }, // Active, Voided
}, { timestamps: true });

expenseSchema.index({ date: -1 });
expenseSchema.index({ carId: 1 });

export default mongoose.model('Expense', expenseSchema);
