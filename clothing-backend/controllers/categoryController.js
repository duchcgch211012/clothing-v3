import Category from "../models/CategoryModels.js";
import Product from "../models/ProductModels.js";

/**
 * CREATE CATEGORY
 * @route   POST /api/categories
 * @access  Private/Admin (tùy theo middleware của bạn)
 */
export const createCategory = async (req, res) => {
  try {
    let { name } = req.body;

    // Sanitize input
    name = name?.trim();

    // Validation
    if (!name) {
      return res.status(400).json({ 
        success: false,
        message: "Category name is required" 
      });
    }

    if (name.length < 2) {
      return res.status(400).json({ 
        success: false,
        message: "Category name must be at least 2 characters long" 
      });
    }

    if (name.length > 100) {
      return res.status(400).json({ 
        success: false,
        message: "Category name must not exceed 100 characters" 
      });
    }

    // Check for duplicate category (case insensitive)
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, "i") } 
    });

    if (existingCategory) {
      return res.status(400).json({ 
        success: false,
        message: "A category with this name already exists" 
      });
    }

    const category = await Category.create({
      ...req.body,
      name: name, // sanitized name
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("Create Category Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while creating category",
      error: error.message 
    });
  }
};

/**
 * GET ALL CATEGORIES
 * @route   GET /api/categories
 * @access  Public
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }); // Sort alphabetically

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error("Get Categories Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching categories" 
    });
  }
};

/**
 * DELETE CATEGORY
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
export const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ 
        success: false,
        message: "Category not found" 
      });
    }

    // Check if category has any products
    const productsCount = await Product.countDocuments({ category: categoryId });

    if (productsCount > 0) {
      return res.status(400).json({ 
        success: false,
        message: "Cannot delete category because it contains products. Please reassign or delete the products first.",
        productsCount 
      });
    }

    await Category.findByIdAndDelete(categoryId);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete Category Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while deleting category" 
    });
  }
};