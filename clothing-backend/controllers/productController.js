import Product from "../models/ProductModels.js";
import Category from "../models/CategoryModels.js";

/**
 * CREATE PRODUCT
 * @route   POST /api/products
 * @access  Private/Admin
 */
export const createProduct = async (req, res) => {
  try {
    let { name, price, category } = req.body;

    // Sanitize
    name = name?.trim();

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Product name is required",
      });
    }

    if (!price || isNaN(price) || price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a number greater than 0",
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Category does not exist",
      });
    }

    // Check duplicate product name (case insensitive)
    const existingProduct = await Product.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "A product with this name already exists",
      });
    }

    const product = await Product.create({
      ...req.body,
      name,
      price: Number(price),
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating product",
      error: error.message,
    });
  }
};

/**
 * GET ALL PRODUCTS
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = async (req, res) => {
  try {
    const { hot } = req.query;

    const filter = hot === "true" ? { isHot: true } : {};

    const products = await Product.find(filter)
      .populate("category", "name") // Chỉ lấy trường name của category
      .sort({ createdAt: -1 }); // Mới nhất lên đầu

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Get Products Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching products",
    });
  }
};

/**
 * GET SINGLE PRODUCT
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching product",
    });
  }
};

/**
 * UPDATE PRODUCT
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
export const updateProduct = async (req, res) => {
  try {
    let { name, price, category } = req.body;

    // Validate nếu có truyền lên
    if (name !== undefined) {
      name = name.trim();
      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Product name cannot be empty",
        });
      }
    }

    if (price !== undefined) {
      if (isNaN(price) || price <= 0) {
        return res.status(400).json({
          success: false,
          message: "Price must be a number greater than 0",
        });
      }
    }

    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: "Category does not exist",
        });
      }
    }

    const updateData = {
      ...req.body,
      name: name || undefined,
      price: price ? Number(price) : undefined,
    };

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("category", "name");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating product",
      error: error.message,
    });
  }
};

/**
 * DELETE PRODUCT
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting product",
    });
  }
};