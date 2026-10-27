import { Category } from '../models/Category.js';

// @desc    Get all active categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ status: 'ACTIVE' }).sort({ name: 1 });
    res.json({
      success: true,
      categories
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get category by slug
// @route   GET /api/categories/:slug
// @access  Public
export const getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, status: 'ACTIVE' });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    res.json({
      success: true,
      category
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (Admin)
export const createCategory = async (req, res, next) => {
  try {
    const { name, description, image, icon, subcategories, featured } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const slug = name.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    const category = await Category.create({
      name,
      slug,
      description: description || '',
      image: image || '',
      icon: icon || '',
      subcategories: subcategories || [],
      featured: Boolean(featured)
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
export const updateCategory = async (req, res, next) => {
  try {
    const { name, description, image, icon, subcategories, status, featured } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    if (name) {
      category.name = name;
      category.slug = name.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
    }
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (icon !== undefined) category.icon = icon;
    if (subcategories !== undefined) category.subcategories = subcategories;
    if (status !== undefined) category.status = status;
    if (featured !== undefined) category.featured = featured;

    await category.save();

    res.json({
      success: true,
      message: 'Category updated successfully',
      category
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
