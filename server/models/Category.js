import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  icon: { type: String, default: '' },
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  subcategories: [{ type: String, trim: true }],
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

export const Category = mongoose.model('Category', CategorySchema);
