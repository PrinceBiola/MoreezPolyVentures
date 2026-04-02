import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Short Name
  description: { type: String }, // Detailed Description
  grade: { type: String },
  openingBal: { type: Number, default: 0 }, // bags
  reorderLevel: { type: Number, default: 5 }, // bags
  currentStock: { type: Number, default: 0 }, // bags
  weightKg: { type: Number, default: 25 }, // conversion (kg per bag)
  status: { type: String, default: 'In Stock' }, // In Stock, Reorder, Out of Stock
  costPrice: { type: Number, default: 0 }, 
  sellingPrice: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
