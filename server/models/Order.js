import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String, required: true },
  partNumber: { type: String, default: '' }
}, { _id: true });

const TimelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  comment: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [OrderItemSchema],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'India' }
  },
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  shippingCost: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['TEST_MODE_CARD', 'RAZORPAY_DEMO', 'COD'], default: 'TEST_MODE_CARD' },
  paymentStatus: { type: String, enum: ['PAID', 'PENDING', 'FAILED', 'REFUNDED'], default: 'PAID' },
  orderStatus: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED'],
    default: 'CONFIRMED'
  },
  trackingNumber: { type: String, default: '' },
  timeline: [TimelineSchema]
}, { timestamps: true });

export const Order = mongoose.model('Order', OrderSchema);
