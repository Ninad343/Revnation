import mongoose from 'mongoose';

const SellerApplicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  businessName: { type: String, required: true, trim: true },
  businessEmail: { type: String, required: true, trim: true },
  businessPhone: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  taxId: { type: String, trim: true, default: '' },
  description: { type: String, required: true },
  categories: [{ type: String, required: true }],
  documents: [{ type: String }],
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  adminNotes: { type: String, default: '' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date, default: null }
}, { timestamps: true });

export const SellerApplication = mongoose.model('SellerApplication', SellerApplicationSchema);
