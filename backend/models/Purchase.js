import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantityPurchased: { type: Number, required: true }, // bags
  qtyKg: { type: Number }, // calculated or stored
  costPerBag: { type: Number, required: true },
  status: { type: String, default: 'Active' }, // Active, Voided
}, { timestamps: true });

export default mongoose.model('Purchase', purchaseSchema);
