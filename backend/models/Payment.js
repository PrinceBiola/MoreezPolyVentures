import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  driver: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: 'Active', index: true }, // Active, Voided
}, { timestamps: true });

paymentSchema.index({ date: -1 });
paymentSchema.index({ carId: 1 });

export default mongoose.model('Payment', paymentSchema);
