import express from 'express';
import {
  getAdminStats,
  getAllUsers,
  updateUserStatus,
  getSellerApplications,
  approveSellerApplication,
  rejectSellerApplication,
  getAllProducts,
  moderateProduct,
  getAllOrders,
  updateOrderStatus,
  getAuditLogs,
  getAdminReviews,
  moderateReview
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Strict RBAC: All admin routes require ADMIN role
router.use(protect, authorize('ADMIN'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);

router.get('/sellers', getSellerApplications);
router.put('/sellers/:id/approve', approveSellerApplication);
router.put('/sellers/:id/reject', rejectSellerApplication);

router.get('/products', getAllProducts);
router.put('/products/:id/moderate', moderateProduct);

router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

router.get('/audit-logs', getAuditLogs);
router.get('/reviews', getAdminReviews);
router.put('/reviews/:id/moderate', moderateReview);

export default router;
