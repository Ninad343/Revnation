import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  addVehicle,
  setActiveVehicle,
  deleteVehicle,
  addAddress,
  deleteAddress
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Vehicle Garage routes
router.post('/vehicles', protect, addVehicle);
router.put('/vehicles/active', protect, setActiveVehicle);
router.delete('/vehicles/:id', protect, deleteVehicle);

// Address routes
router.post('/addresses', protect, addAddress);
router.delete('/addresses/:id', protect, deleteAddress);

export default router;
