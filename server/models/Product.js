import mongoose from 'mongoose';

const CompatibilitySchema = new mongoose.Schema({
  make: { type: String, required: true, trim: true },
  model: { type: String, required: true, trim: true },
  variant: { type: String, default: 'All Variants', trim: true },
  yearStart: { type: Number, required: true },
  yearEnd: { type: Number, required: true }
}, { _id: false });

const SpecificationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  value: { type: String, required: true, trim: true }
}, { _id: false });

const ProductSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true, trim: true },
  subcategory: { type: String, trim: true, default: '' },
  brand: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  discountPrice: { type: Number, default: 0, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 10 },
  sku: { type: String, trim: true },
  partNumber: { type: String, trim: true },
  images: [{ type: String, required: true }],
  specifications: [SpecificationSchema],
  compatibility: [CompatibilitySchema],
  warranty: { type: String, default: '1 Year Manufacturer Warranty' },
  returnPolicy: { type: String, default: '14 Days Replacement Guarantee' },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'APPROVED' },
  isActive: { type: Boolean, default: true },
  badges: [{ type: String, enum: ['NEW', 'BEST SELLER', 'PERFORMANCE', 'VERIFIED', 'LIMITED STOCK', 'COMPATIBLE', 'DEAL', 'TRACK READY', 'OEM FIT'] }],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0, min: 0 },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

// Indexes for fast searching and filtering
ProductSchema.index({ name: 'text', brand: 'text', description: 'text', partNumber: 'text' });
ProductSchema.index({ category: 1, brand: 1, price: 1, status: 1 });
ProductSchema.index({ 'compatibility.make': 1, 'compatibility.model': 1 });

export const Product = mongoose.model('Product', ProductSchema);
