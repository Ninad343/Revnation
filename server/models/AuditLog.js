import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  targetType: { type: String, required: true },
  targetId: { type: String, required: true },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  ipAddress: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: false });

export const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
