import mongoose from 'mongoose';

const debtSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Debtor', 'Creditor'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Pending', 'Settled'],
    default: 'Pending',
    index: true
  }
}, {
  timestamps: true
});

// Index for faster searching and filtering
debtSchema.index({ type: 1, status: 1 });
debtSchema.index({ name: 'text' });

export default mongoose.model('Debt', debtSchema);
