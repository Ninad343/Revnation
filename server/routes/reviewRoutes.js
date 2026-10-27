import express from 'express';
import {
  addReview,
  getProductReviews,
  deleteReview
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/product/:productId', getProductReviews);

// Protected routes
router.post('/', protect, addReview);
router.delete('/:id', protect, deleteReview);

export default router;
