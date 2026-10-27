import { User } from '../models/User.js';
import { Product } from '../models/Product.js';

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'name slug brand price discountPrice stock images rating reviewCount category badges status isActive'
    });

    // Filter out inactive products
    const activeWishlist = (user.wishlist || []).filter(item => item && item.isActive);

    res.json({
      success: true,
      wishlist: activeWishlist
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle product in wishlist (Add/Remove)
// @route   POST /api/wishlist/toggle
// @access  Private
export const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const user = await User.findById(req.user._id);
    const index = user.wishlist.indexOf(productId);
    let isWishlisted = false;

    if (index > -1) {
      user.wishlist.splice(index, 1);
      isWishlisted = false;
    } else {
      user.wishlist.push(productId);
      isWishlisted = true;
    }

    await user.save();

    res.json({
      success: true,
      isWishlisted,
      message: isWishlisted ? 'Added to wishlist' : 'Removed from wishlist',
      wishlistCount: user.wishlist.length
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove specific product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.productId);
    await user.save();

    res.json({
      success: true,
      message: 'Product removed from wishlist',
      wishlistCount: user.wishlist.length
    });
  } catch (err) {
    next(err);
  }
};
