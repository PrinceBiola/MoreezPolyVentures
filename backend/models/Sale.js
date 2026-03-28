import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantitySold: { type: Number, required: true }, // bags
  qtyKg: { type: Number }, // calculated
  salesPrice: { type: Number, required: true },
});

const saleSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  customerName: { type: String, required: true },
  items: [itemSchema],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'Active', index: true }, // Active, Voided
}, { timestamps: true });

saleSchema.index({ date: 1 });
saleSchema.index({ createdAt: -1 });

export default mongoose.model('Sale', saleSchema);
