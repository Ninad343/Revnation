import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['ORDER', 'SELLER_APPLICATION', 'PRODUCT', 'SYSTEM'],
    default: 'SYSTEM'
  },
  read: { type: Boolean, default: false },
  link: { type: String, default: '' }
}, { timestamps: true });

export const Notification = mongoose.model('Notification', NotificationSchema);
