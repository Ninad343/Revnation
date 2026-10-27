import { User } from '../models/User.js';
import { SellerApplication } from '../models/SellerApplication.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { AuditLog } from '../models/AuditLog.js';
import { Notification } from '../models/Notification.js';
import { Review } from '../models/Review.js';

// @desc    Get overall admin platform stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalSellers,
      pendingApplications,
      totalProducts,
      totalOrders,
      lowStockProducts,
      orders
    ] = await Promise.all([
      User.countDocuments({ role: 'USER' }),
      User.countDocuments({ role: 'SELLER' }),
      SellerApplication.countDocuments({ status: 'PENDING' }),
      Product.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments({ stock: { $lte: 5 } }),
      Order.find().select('total orderStatus paymentStatus createdAt')
    ]);

    const totalRevenue = orders
      .filter(o => o.paymentStatus === 'PAID')
      .reduce((sum, o) => sum + o.total, 0);

    const pendingOrders = orders
      .filter(o => ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(o.orderStatus)).length;

    // Category breakdown
    const categoryStats = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalSellers,
        pendingApplications,
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingOrders,
        lowStockProducts
      },
      categoryStats
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users with search & filters
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, status, q } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (status) filter.status = status;
    if (q) {
      const search = new RegExp(q.trim(), 'i');
      filter.$or = [{ name: search }, { email: search }, { phone: search }];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user status (Suspend / Activate)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
export const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'ADMIN') {
      return res.status(400).json({ success: false, message: 'Cannot change status of an Administrator' });
    }

    const prevStatus = user.status;
    user.status = status;
    await user.save();

    await AuditLog.create({
      admin: req.user._id,
      action: 'USER_STATUS_CHANGE',
      targetType: 'User',
      targetId: user._id.toString(),
      details: { from: prevStatus, to: status, userEmail: user.email },
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: `User marked as ${status}`,
      user: { id: user._id, name: user.name, email: user.email, status: user.status }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all seller applications
// @route   GET /api/admin/sellers
// @access  Private (Admin)
export const getSellerApplications = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const applications = await SellerApplication.find(filter)
      .populate('user', 'name email phone createdAt')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve seller application
// @route   PUT /api/admin/sellers/:id/approve
// @access  Private (Admin)
export const approveSellerApplication = async (req, res, next) => {
  try {
    const application = await SellerApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.status = 'APPROVED';
    application.adminNotes = req.body.notes || 'Approved by administrator';
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();
    await application.save();

    // Upgrade User role to SELLER
    const user = await User.findById(application.user);
    if (user) {
      user.role = 'SELLER';
      await user.save();

      // Send notification to user
      await Notification.create({
        user: user._id,
        title: 'Seller Application Approved! 🎉',
        message: 'Congratulations! Your RevNation seller account has been approved. You can now access your Seller Dashboard and list automobile parts.',
        type: 'SELLER_APPLICATION',
        link: '/seller'
      });
    }

    // Log admin audit
    await AuditLog.create({
      admin: req.user._id,
      action: 'SELLER_APPROVED',
      targetType: 'SellerApplication',
      targetId: application._id.toString(),
      details: { businessName: application.businessName, userId: application.user },
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: 'Seller application approved successfully. User role upgraded to SELLER.',
      application
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reject seller application
// @route   PUT /api/admin/sellers/:id/reject
// @access  Private (Admin)
export const rejectSellerApplication = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const application = await SellerApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.status = 'REJECTED';
    application.adminNotes = reason || 'Application did not meet marketplace requirements';
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();
    await application.save();

    // Send notification
    await Notification.create({
      user: application.user,
      title: 'Seller Application Update',
      message: `Your seller application was reviewed and rejected. Reason: ${application.adminNotes}`,
      type: 'SELLER_APPLICATION',
      link: '/become-seller'
    });

    await AuditLog.create({
      admin: req.user._id,
      action: 'SELLER_REJECTED',
      targetType: 'SellerApplication',
      targetId: application._id.toString(),
      details: { businessName: application.businessName, reason: application.adminNotes },
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: 'Seller application rejected',
      application
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all products for administration
// @route   GET /api/admin/products
// @access  Private (Admin)
export const getAllProducts = async (req, res, next) => {
  try {
    const { status, category, q } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (q) {
      const search = new RegExp(q.trim(), 'i');
      filter.$or = [{ name: search }, { brand: search }, { partNumber: search }];
    }

    const products = await Product.find(filter)
      .populate('seller', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Moderate product (Approve/Reject/Toggle Active)
// @route   PUT /api/admin/products/:id/moderate
// @access  Private (Admin)
export const moderateProduct = async (req, res, next) => {
  try {
    const { status, isActive } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (status) product.status = status;
    if (isActive !== undefined) product.isActive = isActive;

    await product.save();

    await AuditLog.create({
      admin: req.user._id,
      action: 'PRODUCT_MODERATED',
      targetType: 'Product',
      targetId: product._id.toString(),
      details: { status, isActive, productName: product.name },
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: 'Product moderation updated',
      product
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all platform orders
// @route   GET /api/admin/orders
// @access  Private (Admin)
export const getAllOrders = async (req, res, next) => {
  try {
    const { status, q } = req.query;
    const filter = {};

    if (status) filter.orderStatus = status;
    if (q) {
      filter.orderNumber = new RegExp(q.trim(), 'i');
    }

    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .populate('items.seller', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/admin/orders/:id/status
// @access  Private (Admin)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber, note, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (status) {
      order.orderStatus = status;
      order.timeline.push({
        status,
        comment: note || `Status updated by Admin (${req.user.name})`,
        timestamp: new Date()
      });
    }

    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();

    await AuditLog.create({
      admin: req.user._id,
      action: 'ORDER_STATUS_CHANGE',
      targetType: 'Order',
      targetId: order._id.toString(),
      details: { orderNumber: order.orderNumber, status, paymentStatus },
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: 'Order updated successfully',
      order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get audit logs
// @route   GET /api/admin/audit-logs
// @access  Private (Admin)
export const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .populate('admin', 'name email')
      .sort({ timestamp: -1 })
      .limit(100);

    res.json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get reviews for moderation
// @route   GET /api/admin/reviews
// @access  Private (Admin)
export const getAdminReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate('product', 'name slug images')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reviews
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Moderate review
// @route   PUT /api/admin/reviews/:id/moderate
// @access  Private (Admin)
export const moderateReview = async (req, res, next) => {
  try {
    const { status } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.json({
      success: true,
      message: 'Review moderated',
      review
    });
  } catch (err) {
    next(err);
  }
};
