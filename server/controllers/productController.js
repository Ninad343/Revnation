import { Product } from '../models/Product.js';
import { User } from '../models/User.js';

// Helper to generate URL-friendly slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 7);
};

// @desc    Get all products with filtering, vehicle compatibility, search & pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const {
      q,
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      badge,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      sort = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    const query = {
      status: 'APPROVED',
      isActive: true
    };

    // Text / keyword search
    if (q) {
      const searchRegex = new RegExp(q.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { brand: searchRegex },
        { partNumber: searchRegex },
        { description: searchRegex },
        { category: searchRegex }
      ];
    }

    // Category / subcategory filter
    if (category) {
      query.category = new RegExp(`^${category}$`, 'i');
    }
    if (subcategory) {
      query.subcategory = new RegExp(`^${subcategory}$`, 'i');
    }

    // Brand filter
    if (brand) {
      if (Array.isArray(brand)) {
        query.brand = { $in: brand.map(b => new RegExp(`^${b}$`, 'i')) };
      } else {
        query.brand = new RegExp(`^${brand}$`, 'i');
      }
    }

    // Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Rating filter
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    // Stock availability
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Badge filter
    if (badge) {
      query.badges = badge;
    }

    // Vehicle Compatibility filter
    if (vehicleMake && vehicleModel) {
      const year = vehicleYear ? Number(vehicleYear) : null;
      const compatibilityMatch = {
        make: new RegExp(`^${vehicleMake}$`, 'i'),
        model: new RegExp(`^${vehicleModel}$`, 'i')
      };

      if (year) {
        compatibilityMatch.yearStart = { $lte: year };
        compatibilityMatch.yearEnd = { $gte: year };
      }

      query.compatibility = { $elemMatch: compatibilityMatch };
    }

    // Sorting
    let sortOptions = {};
    if (sort === 'price_asc') sortOptions = { price: 1 };
    else if (sort === 'price_desc') sortOptions = { price: -1 };
    else if (sort === 'rating') sortOptions = { rating: -1, reviewCount: -1 };
    else if (sort === 'popular') sortOptions = { reviewCount: -1, rating: -1 };
    else sortOptions = { createdAt: -1 }; // newest

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('seller', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(query)
    ]);

    // Available brands and categories for dynamic filter options
    const [allBrands, allCategories] = await Promise.all([
      Product.distinct('brand', { status: 'APPROVED', isActive: true }),
      Product.distinct('category', { status: 'APPROVED', isActive: true })
    ]);

    res.json({
      success: true,
      count: products.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      brands: allBrands,
      categories: allCategories,
      products
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single product by slug or ID
// @route   GET /api/products/:slugOrId
// @access  Public
export const getProductBySlugOrId = async (req, res, next) => {
  try {
    const { slugOrId } = req.params;
    let product;

    if (slugOrId.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(slugOrId).populate('seller', 'name email phone');
    } else {
      product = await Product.findOne({ slug: slugOrId }).populate('seller', 'name email phone');
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Fetch related products from same category
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      status: 'APPROVED',
      isActive: true
    }).limit(4);

    res.json({
      success: true,
      product,
      relatedProducts
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create product (Seller only)
// @route   POST /api/products
// @access  Private (Seller/Admin)
export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      subcategory,
      brand,
      price,
      discountPrice,
      stock,
      sku,
      partNumber,
      images,
      specifications,
      compatibility,
      warranty,
      returnPolicy,
      badges
    } = req.body;

    if (!name || !description || !category || !brand || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, category, brand, and price are required'
      });
    }

    const slug = generateSlug(name);

    const product = await Product.create({
      seller: req.user._id,
      name,
      slug,
      description,
      category,
      subcategory: subcategory || '',
      brand,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : 0,
      stock: stock !== undefined ? Number(stock) : 10,
      sku: sku || `SKU-${Date.now().toString().slice(-6)}`,
      partNumber: partNumber || `PN-${Date.now().toString().slice(-6)}`,
      images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80'],
      specifications: specifications || [],
      compatibility: compatibility || [],
      warranty: warranty || '1 Year Manufacturer Warranty',
      returnPolicy: returnPolicy || '14 Days Replacement Guarantee',
      status: 'APPROVED',
      isActive: true,
      badges: badges || ['NEW']
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Seller/Admin)
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Verify ownership if role is SELLER
    if (req.user.role === 'SELLER' && product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    const updatableFields = [
      'name', 'description', 'category', 'subcategory', 'brand',
      'price', 'discountPrice', 'stock', 'sku', 'partNumber',
      'images', 'specifications', 'compatibility', 'warranty',
      'returnPolicy', 'isActive', 'badges'
    ];

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Seller/Admin)
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Verify ownership
    if (req.user.role === 'SELLER' && product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product removed successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get products listed by the logged-in seller
// @route   GET /api/products/seller/me
// @access  Private (Seller)
export const getSellerProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update product stock directly
// @route   PATCH /api/products/:id/stock
// @access  Private (Seller/Admin)
export const updateStock = async (req, res, next) => {
  try {
    const { stock } = req.body;
    if (stock === undefined || isNaN(stock) || Number(stock) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid non-negative stock number required'
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (req.user.role === 'SELLER' && product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this product'
      });
    }

    product.stock = Number(stock);
    await product.save();

    res.json({
      success: true,
      message: 'Inventory stock updated',
      stock: product.stock
    });
  } catch (err) {
    next(err);
  }
};
