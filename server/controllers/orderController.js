import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Cart } from '../models/Cart.js';
import { Notification } from '../models/Notification.js';

// Helper to generate unique order number
const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `RN-${dateStr}-${rand}`;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod = 'TEST_MODE_CARD', items: directItems } = req.body;

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city || !shippingAddress.postalCode) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address is required'
      });
    }

    let orderItemsToProcess = [];

    if (directItems && Array.isArray(directItems) && directItems.length > 0) {
      orderItemsToProcess = directItems;
    } else {
      const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Your cart is empty'
        });
      }
      orderItemsToProcess = cart.items.map(it => ({
        product: it.product._id,
        quantity: it.quantity
      }));
    }

    // Verify stock and prepare snapshotted order items
    const finalItems = [];
    let subtotal = 0;

    for (const item of orderItemsToProcess) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive || product.status !== 'APPROVED') {
        return res.status(400).json({
          success: false,
          message: `Product "${product ? product.name : 'Unknown'}" is not available`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.stock} left.`
        });
      }

      const unitPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
      subtotal += unitPrice * item.quantity;

      finalItems.push({
        product: product._id,
        seller: product.seller,
        name: product.name,
        brand: product.brand,
        price: unitPrice,
        quantity: item.quantity,
        image: product.images[0] || '',
        partNumber: product.partNumber || ''
      });
    }

    // Decrement stock in MongoDB
    for (const item of orderItemsToProcess) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    const shippingCost = subtotal > 5000 ? 0 : 250;
    const total = subtotal + shippingCost;
    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      items: finalItems,
      shippingAddress,
      subtotal,
      discount: 0,
      shippingCost,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
      orderStatus: 'CONFIRMED',
      timeline: [
        {
          status: 'CONFIRMED',
          comment: `Order placed via ${paymentMethod.replace(/_/g, ' ')}. Stock reserved.`,
          timestamp: new Date()
        }
      ]
    });

    // Clear cart if user had items in cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    // Notify user
    await Notification.create({
      user: req.user._id,
      title: 'Order Confirmed!',
      message: `Your order #${order.orderNumber} for ₹${total.toLocaleString('en-IN')} has been confirmed.`,
      type: 'ORDER',
      link: `/orders/${order._id}`
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get order details by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.seller', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Role check: Buyer, Seller of an item in order, or Admin
    const isBuyer = order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';
    const isSeller = order.items.some(
      it => it.seller && it.seller._id.toString() === req.user._id.toString()
    );

    if (!isBuyer && !isAdmin && !isSeller) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel order (User)
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    if (['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is already ${order.orderStatus.toLowerCase().replace(/_/g, ' ')}`
      });
    }

    order.orderStatus = 'CANCELLED';
    order.timeline.push({
      status: 'CANCELLED',
      comment: 'Cancelled by user. Inventory returned.',
      timestamp: new Date()
    });

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order has been cancelled and stock restored',
      order
    });
  } catch (err) {
    next(err);
  }
};
