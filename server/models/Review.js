import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true, trim: true },
  comment: { type: String, required: true, trim: true },
  status: { type: String, enum: ['APPROVED', 'PENDING', 'REJECTED'], default: 'APPROVED' },
  verifiedPurchase: { type: Boolean, default: true }
}, { timestamps: true });

// Prevent duplicate review for the same product by the same user
ReviewSchema.index({ user: 1, product: 1 }, { unique: true });

export const Review = mongoose.model('Review', ReviewSchema);
