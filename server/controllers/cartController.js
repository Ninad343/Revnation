import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name slug brand price discountPrice stock images partNumber status isActive'
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Filter out deleted/inactive products if any
    cart.items = cart.items.filter(item => item.product && item.product.isActive);

    const subtotal = cart.items.reduce((sum, item) => {
      const activePrice = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
      return sum + (activePrice * item.quantity);
    }, 0);

    const shipping = subtotal > 5000 || subtotal === 0 ? 0 : 250;
    const total = subtotal + shipping;

    res.json({
      success: true,
      cart: {
        _id: cart._id,
        items: cart.items,
        subtotal,
        shipping,
        total
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive || product.status !== 'APPROVED') {
      return res.status(404).json({
        success: false,
        message: 'Product not available'
      });
    }

    const qtyToAdd = Math.max(1, parseInt(quantity, 10));

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    const existingQty = itemIndex > -1 ? cart.items[itemIndex].quantity : 0;
    const requestedTotalQty = existingQty + qtyToAdd;

    if (requestedTotalQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} units available in stock. Cannot add ${qtyToAdd} more.`
      });
    }

    const unitPrice = product.discountPrice > 0 ? product.discountPrice : product.price;

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = requestedTotalQty;
      cart.items[itemIndex].price = unitPrice;
    } else {
      cart.items.push({
        product: product._id,
        quantity: qtyToAdd,
        price: unitPrice
      });
    }

    await cart.save();
    await cart.populate({
      path: 'items.product',
      select: 'name slug brand price discountPrice stock images partNumber status isActive'
    });

    res.json({
      success: true,
      message: 'Item added to cart',
      itemsCount: cart.items.reduce((acc, it) => acc + it.quantity, 0)
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
export const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const newQty = parseInt(quantity, 10);

    if (isNaN(newQty) || newQty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    const product = await Product.findById(item.product);
    if (!product) {
      cart.items.pull(item._id);
      await cart.save();
      return res.status(404).json({ success: false, message: 'Product is no longer available' });
    }

    if (newQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} units in stock`
      });
    }

    item.quantity = newQty;
    await cart.save();

    res.json({
      success: true,
      message: 'Cart quantity updated'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
export const removeCartItem = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
    await cart.save();

    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (err) {
    next(err);
  }
};
