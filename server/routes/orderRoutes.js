import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder
} from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

export default router;
