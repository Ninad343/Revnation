import { User } from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Role always defaults to USER
    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      role: 'USER',
      status: 'ACTIVE'
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        activeVehicle: user.activeVehicle,
        vehicles: user.vehicles,
        addresses: user.addresses
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        message: 'Your account is suspended. Contact support.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        activeVehicle: user.activeVehicle,
        vehicles: user.vehicles,
        addresses: user.addresses,
        wishlist: user.wishlist
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        activeVehicle: user.activeVehicle,
        vehicles: user.vehicles,
        addresses: user.addresses
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add vehicle to garage
// @route   POST /api/auth/vehicles
// @access  Private
export const addVehicle = async (req, res, next) => {
  try {
    const { make, model, variant, year, fuelType, nickname } = req.body;
    if (!make || !model || !year) {
      return res.status(400).json({
        success: false,
        message: 'Make, model, and year are required'
      });
    }

    const user = await User.findById(req.user._id);
    const newVehicle = {
      make,
      model,
      variant: variant || '',
      year: Number(year),
      fuelType: fuelType || 'Petrol',
      nickname: nickname || `${year} ${make} ${model}`
    };

    user.vehicles.push(newVehicle);
    // If no active vehicle exists, set this vehicle as active
    if (!user.activeVehicle || !user.activeVehicle.make) {
      user.activeVehicle = newVehicle;
    }

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Vehicle added to My Garage',
      vehicles: user.vehicles,
      activeVehicle: user.activeVehicle
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Set active garage vehicle
// @route   PUT /api/auth/vehicles/active
// @access  Private
export const setActiveVehicle = async (req, res, next) => {
  try {
    const { vehicleId } = req.body;
    const user = await User.findById(req.user._id);

    if (!vehicleId) {
      // Clear active vehicle
      user.activeVehicle = undefined;
      await user.save();
      return res.json({
        success: true,
        message: 'Active vehicle cleared',
        activeVehicle: null
      });
    }

    const selected = user.vehicles.id(vehicleId);
    if (!selected) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found in garage'
      });
    }

    user.activeVehicle = {
      make: selected.make,
      model: selected.model,
      variant: selected.variant,
      year: selected.year,
      fuelType: selected.fuelType
    };

    await user.save();

    res.json({
      success: true,
      message: `Active vehicle set to ${selected.year} ${selected.make} ${selected.model}`,
      activeVehicle: user.activeVehicle
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete vehicle from garage
// @route   DELETE /api/auth/vehicles/:id
// @access  Private
export const deleteVehicle = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.vehicles = user.vehicles.filter(v => v._id.toString() !== req.params.id);

    // If active vehicle was deleted, set next available or null
    if (user.activeVehicle && user.vehicles.length > 0) {
      user.activeVehicle = user.vehicles[0];
    } else if (user.vehicles.length === 0) {
      user.activeVehicle = undefined;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Vehicle removed from garage',
      vehicles: user.vehicles,
      activeVehicle: user.activeVehicle
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add shipping address
// @route   POST /api/auth/addresses
// @access  Private
export const addAddress = async (req, res, next) => {
  try {
    const { fullName, phone, street, city, state, postalCode, country, isDefault } = req.body;
    if (!fullName || !phone || !street || !city || !state || !postalCode) {
      return res.status(400).json({
        success: false,
        message: 'All address fields are required'
      });
    }

    const user = await User.findById(req.user._id);
    if (isDefault) {
      user.addresses.forEach(a => a.isDefault = false);
    }
    user.addresses.push({
      fullName,
      phone,
      street,
      city,
      state,
      postalCode,
      country: country || 'India',
      isDefault: isDefault || user.addresses.length === 0
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      addresses: user.addresses
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete shipping address
// @route   DELETE /api/auth/addresses/:id
// @access  Private
export const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.id);
    await user.save();

    res.json({
      success: true,
      message: 'Address removed successfully',
      addresses: user.addresses
    });
  } catch (err) {
    next(err);
  }
};
