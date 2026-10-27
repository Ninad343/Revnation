import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';

// @desc    Add review for a purchased product
// @route   POST /api/reviews
// @access  Private
export const addReview = async (req, res, next) => {
  try {
    const { productId, rating, title, comment } = req.body;

    if (!productId || !rating || !title || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Product, rating (1-5), title, and comment are required'
      });
    }

    const ratingNum = Number(rating);
    if (ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5'
      });
    }

    // 1. Check if user already reviewed this product
    const existingReview = await Review.findOne({ user: req.user._id, product: productId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this product'
      });
    }

    // 2. Check if user actually purchased this product in a confirmed/delivered order
    const purchaseOrder = await Order.findOne({
      user: req.user._id,
      'items.product': productId,
      orderStatus: { $in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'] }
    });

    if (!purchaseOrder) {
      return res.status(403).json({
        success: false,
        message: 'Verified Purchase Required: You can only review products you have purchased and had confirmed on RevNation.'
      });
    }

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      order: purchaseOrder._id,
      rating: ratingNum,
      title,
      comment,
      status: 'APPROVED',
      verifiedPurchase: true
    });

    // 3. Recalculate product average rating & review count
    const allReviews = await Review.find({ product: productId, status: 'APPROVED' });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: allReviews.length
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, status: 'APPROVED' })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    const total = reviews.length;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let ratingSum = 0;

    reviews.forEach(r => {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
      ratingSum += r.rating;
    });

    const averageRating = total > 0 ? Math.round((ratingSum / total) * 10) / 10 : 0;

    res.json({
      success: true,
      total,
      averageRating,
      distribution,
      reviews
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Owner/Admin)
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(req.params.id);

    // Recalculate product rating
    const remaining = await Review.find({ product: productId, status: 'APPROVED' });
    const avg = remaining.length > 0 ? remaining.reduce((s, r) => s + r.rating, 0) / remaining.length : 0;
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(avg * 10) / 10,
      reviewCount: remaining.length
    });

    res.json({
      success: true,
      message: 'Review removed'
    });
  } catch (err) {
    next(err);
  }
};
