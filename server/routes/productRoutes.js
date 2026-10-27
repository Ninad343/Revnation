import express from 'express';
import {
  getProducts,
  getProductBySlugOrId,
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  updateStock
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/seller/me', protect, authorize('SELLER', 'ADMIN'), getSellerProducts);
router.get('/:slugOrId', getProductBySlugOrId);

// Seller/Admin protected endpoints
router.post('/', protect, authorize('SELLER', 'ADMIN'), createProduct);
router.put('/:id', protect, authorize('SELLER', 'ADMIN'), updateProduct);
router.delete('/:id', protect, authorize('SELLER', 'ADMIN'), deleteProduct);
router.patch('/:id/stock', protect, authorize('SELLER', 'ADMIN'), updateStock);

export default router;
