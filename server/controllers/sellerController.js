import { SellerApplication } from '../models/SellerApplication.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { Notification } from '../models/Notification.js';

// @desc    Apply to become a seller
// @route   POST /api/sellers/apply
// @access  Private (User)
export const applySeller = async (req, res, next) => {
  try {
    const {
      businessName,
      businessEmail,
      businessPhone,
      address,
      taxId,
      description,
      categories,
      documents
    } = req.body;

    if (!businessName || !businessEmail || !businessPhone || !address || !description || !categories || categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Business name, email, phone, address, description, and at least one category are required'
      });
    }

    if (req.user.role === 'SELLER') {
      return res.status(400).json({
        success: false,
        message: 'You are already an approved seller on RevNation'
      });
    }

    const existingApp = await SellerApplication.findOne({ user: req.user._id });
    if (existingApp && existingApp.status === 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending seller application under review'
      });
    }

    let application;
    if (existingApp) {
      // Re-apply if previously rejected
      existingApp.businessName = businessName;
      existingApp.businessEmail = businessEmail;
      existingApp.businessPhone = businessPhone;
      existingApp.address = address;
      existingApp.taxId = taxId || '';
      existingApp.description = description;
      existingApp.categories = categories;
      existingApp.documents = documents || [];
      existingApp.status = 'PENDING';
      existingApp.adminNotes = '';
      existingApp.reviewedAt = null;
      application = await existingApp.save();
    } else {
      application = await SellerApplication.create({
        user: req.user._id,
        businessName,
        businessEmail,
        businessPhone,
        address,
        taxId: taxId || '',
        description,
        categories,
        documents: documents || [],
        status: 'PENDING'
      });
    }

    // In-app notification for the user
    await Notification.create({
      user: req.user._id,
      title: 'Seller Application Submitted',
      message: `Your seller application for "${businessName}" has been submitted for administrator review.`,
      type: 'SELLER_APPLICATION',
      link: '/become-seller'
    });

    res.status(201).json({
      success: true,
      message: 'Seller application submitted successfully. An administrator will review your application.',
      application
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user's seller application
// @route   GET /api/sellers/application
// @access  Private (User)
export const getMyApplication = async (req, res, next) => {
  try {
    const application = await SellerApplication.findOne({ user: req.user._id });
    res.json({
      success: true,
      application
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get seller dashboard metrics
// @route   GET /api/sellers/dashboard
// @access  Private (Seller)
export const getSellerDashboardStats = async (req, res, next) => {
  try {
    const sellerId = req.user._id;

    const [totalProducts, activeProducts, lowStockProducts, sellerProducts] = await Promise.all([
      Product.countDocuments({ seller: sellerId }),
      Product.countDocuments({ seller: sellerId, isActive: true, status: 'APPROVED' }),
      Product.countDocuments({ seller: sellerId, stock: { $lte: 5 } }),
      Product.find({ seller: sellerId }).select('_id')
    ]);

    const productIds = sellerProducts.map(p => p._id);

    // Orders containing items sold by this seller
    const orders = await Order.find({ 'items.seller': sellerId }).sort({ createdAt: -1 });

    let totalSales = 0;
    let pendingOrdersCount = 0;

    orders.forEach(order => {
      if (['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.orderStatus)) {
        pendingOrdersCount++;
      }

      order.items.forEach(item => {
        if (item.seller.toString() === sellerId.toString()) {
          totalSales += item.price * item.quantity;
        }
      });
    });

    res.json({
      success: true,
      stats: {
        totalProducts,
        activeProducts,
        lowStockProducts,
        totalOrders: orders.length,
        totalSales,
        pendingOrders: pendingOrdersCount
      },
      recentOrders: orders.slice(0, 5)
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get orders for this seller
// @route   GET /api/sellers/orders
// @access  Private (Seller)
export const getSellerOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ 'items.seller': req.user._id })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    // Filter order items to only show those belonging to this seller
    const tailoredOrders = orders.map(order => {
      const orderObj = order.toObject();
      orderObj.sellerItems = orderObj.items.filter(
        item => item.seller.toString() === req.user._id.toString()
      );
      orderObj.sellerSubtotal = orderObj.sellerItems.reduce(
        (sum, it) => sum + (it.price * it.quantity), 0
      );
      return orderObj;
    });

    res.json({
      success: true,
      orders: tailoredOrders
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update order status for seller items
// @route   PUT /api/sellers/orders/:id/status
// @access  Private (Seller)
export const updateSellerOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber, note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const hasSellerItem = order.items.some(
      item => item.seller.toString() === req.user._id.toString()
    );

    if (!hasSellerItem && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized for this order' });
    }

    if (status) {
      order.orderStatus = status;
      order.timeline.push({
        status,
        comment: note || `Order updated by seller (${req.user.name})`,
        timestamp: new Date()
      });
    }

    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    await order.save();

    // Notify buyer
    await Notification.create({
      user: order.user,
      title: `Order Status: ${status}`,
      message: `Your order #${order.orderNumber} is now ${status.replace(/_/g, ' ')}. ${trackingNumber ? `Tracking: ${trackingNumber}` : ''}`,
      type: 'ORDER',
      link: `/orders/${order._id}`
    });

    res.json({
      success: true,
      message: 'Order status updated',
      order
    });
  } catch (err) {
    next(err);
  }
};
