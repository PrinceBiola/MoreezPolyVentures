import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
  plateNumber: { type: String, required: true, unique: true },
  model: { type: String, required: true },
  driverName: { type: String, required: true },
  status: { 
    type: String, 
    default: 'Active', 
    enum: ['Active', 'Maintenance', 'Impounded', 'Deactivated'],
    index: true
  },
}, { timestamps: true });

export default mongoose.model('Car', carSchema);
