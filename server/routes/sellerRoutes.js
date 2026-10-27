import express from 'express';
import {
  applySeller,
  getMyApplication,
  getSellerDashboardStats,
  getSellerOrders,
  updateSellerOrderStatus
} from '../controllers/sellerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// User-accessible seller application endpoints
router.post('/apply', applySeller);
router.get('/application', getMyApplication);

// Seller-only endpoints (Strictly RBAC protected!)
router.get('/dashboard', authorize('SELLER', 'ADMIN'), getSellerDashboardStats);
router.get('/orders', authorize('SELLER', 'ADMIN'), getSellerOrders);
router.put('/orders/:id/status', authorize('SELLER', 'ADMIN'), updateSellerOrderStatus);

export default router;
