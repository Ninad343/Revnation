import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const VehicleSchema = new mongoose.Schema({
  make: { type: String, required: true, trim: true },
  model: { type: String, required: true, trim: true },
  variant: { type: String, trim: true },
  year: { type: Number, required: true },
  fuelType: { type: String, enum: ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'Other'], default: 'Petrol' },
  nickname: { type: String, trim: true }
}, { _id: true });

const AddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  street: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  postalCode: { type: String, required: true, trim: true },
  country: { type: String, default: 'India' },
  isDefault: { type: Boolean, default: false }
}, { _id: true });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, trim: true },
  role: { type: String, enum: ['USER', 'SELLER', 'ADMIN'], default: 'USER' },
  status: { type: String, enum: ['ACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
  avatar: { type: String, default: '' },
  addresses: [AddressSchema],
  vehicles: [VehicleSchema],
  activeVehicle: {
    make: String,
    model: String,
    variant: String,
    year: Number,
    fuelType: String
  },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', UserSchema);
