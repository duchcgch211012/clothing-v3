import mongoose from "mongoose"
import Product from "../models/ProductModels.js"
import Category from "../models/CategoryModels.js"

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const parsePositiveNumber = (value) => {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : null
}

/**
 * CREATE PRODUCT
 * @route   POST /api/products
 * @access  Private/Admin
 */
export const createProduct = async (req, res) => {
  try {
    let { name, price, category } = req.body
    name = name?.trim()

    if (!name) {
      return res.status(400).json({ success: false, message: "Product name is required" })
    }

    const parsedPrice = parsePositiveNumber(price)
    if (!parsedPrice) {
      return res.status(400).json({ success: false, message: "Price must be a number greater than 0" })
    }

    if (!category || !mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ success: false, message: "Valid category is required" })
    }

    const categoryExists = await Category.findById(category)
    if (!categoryExists) {
      return res.status(400).json({ success: false, message: "Category does not exist" })
    }

    const existingProduct = await Product.findOne({
      name: { $regex: new RegExp(`^${escapeRegex(name)}$`, "i") },
    })

    if (existingProduct) {
      return res.status(400).json({ success: false, message: "A product with this name already exists" })
    }

    const product = await Product.create({
      ...req.body,
      name,
      price: parsedPrice,
      stock: Math.max(0, Number(req.body.stock) || 0),
      rating: Math.min(5, Math.max(0, Number(req.body.rating) || 0)),
      sold: Math.max(0, Number(req.body.sold) || 0),
      discount: Math.min(100, Math.max(0, Number(req.body.discount) || 0)),
    })

    const populated = await product.populate("category", "name")

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: populated,
    })
  } catch (error) {
    console.error("Create Product Error:", error)
    res.status(500).json({ success: false, message: "Server error while creating product", error: error.message })
  }
}

/**
 * GET ALL PRODUCTS
 * @route   GET /api/products
 * @access  Public
 * @query   search, category, hot, minPrice, maxPrice, sort, page, limit
 */
export const getProducts = async (req, res) => {
  try {
    const {
      search = "",
      category,
      hot,
      minPrice,
      maxPrice,
      sort = "newest",
      page = 1,
      limit = 0,
    } = req.query

    const filter = {}

    if (hot === "true") filter.isHot = true
    if (category && category !== "all" && mongoose.Types.ObjectId.isValid(category)) filter.category = category
    if (search.trim()) filter.name = { $regex: escapeRegex(search.trim()), $options: "i" }

    const priceFilter = {}
    if (minPrice !== undefined && Number(minPrice) >= 0) priceFilter.$gte = Number(minPrice)
    if (maxPrice !== undefined && Number(maxPrice) >= 0) priceFilter.$lte = Number(maxPrice)
    if (Object.keys(priceFilter).length) filter.price = priceFilter

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      "price-asc": { price: 1 },
      "price-desc": { price: -1 },
      popular: { sold: -1 },
      rating: { rating: -1 },
    }

    const pageNumber = Math.max(1, Number(page) || 1)
    const limitNumber = Math.max(0, Math.min(100, Number(limit) || 0))

    let query = Product.find(filter)
      .populate("category", "name")
      .sort(sortMap[sort] || sortMap.newest)

    if (limitNumber > 0) {
      query = query.skip((pageNumber - 1) * limitNumber).limit(limitNumber)
    }

    const [products, total] = await Promise.all([
      query,
      Product.countDocuments(filter),
    ])

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: pageNumber,
      pages: limitNumber > 0 ? Math.ceil(total / limitNumber) : 1,
      data: products,
    })
  } catch (error) {
    console.error("Get Products Error:", error)
    res.status(500).json({ success: false, message: "Server error while fetching products" })
  }
}

/**
 * GET SINGLE PRODUCT
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid product id" })
    }

    const product = await Product.findById(req.params.id).populate("category", "name")

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" })
    }

    res.status(200).json({ success: true, data: product })
  } catch (error) {
    console.error("Get Product Error:", error)
    res.status(500).json({ success: false, message: "Server error while fetching product" })
  }
}

/**
 * UPDATE PRODUCT
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
export const updateProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid product id" })
    }

    const updateData = { ...req.body }

    if (updateData.name !== undefined) {
      updateData.name = updateData.name.trim()
      if (!updateData.name) {
        return res.status(400).json({ success: false, message: "Product name cannot be empty" })
      }
    }

    if (updateData.price !== undefined) {
      const parsedPrice = parsePositiveNumber(updateData.price)
      if (!parsedPrice) {
        return res.status(400).json({ success: false, message: "Price must be a number greater than 0" })
      }
      updateData.price = parsedPrice
    }

    if (updateData.category) {
      if (!mongoose.Types.ObjectId.isValid(updateData.category)) {
        return res.status(400).json({ success: false, message: "Invalid category id" })
      }
      const categoryExists = await Category.findById(updateData.category)
      if (!categoryExists) {
        return res.status(400).json({ success: false, message: "Category does not exist" })
      }
    }

    for (const key of ["stock", "sold"]) {
      if (updateData[key] !== undefined) updateData[key] = Math.max(0, Number(updateData[key]) || 0)
    }
    if (updateData.rating !== undefined) updateData.rating = Math.min(5, Math.max(0, Number(updateData.rating) || 0))
    if (updateData.discount !== undefined) updateData.discount = Math.min(100, Math.max(0, Number(updateData.discount) || 0))

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("category", "name")

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" })
    }

    res.status(200).json({ success: true, message: "Product updated successfully", data: product })
  } catch (error) {
    console.error("Update Product Error:", error)
    res.status(500).json({ success: false, message: "Server error while updating product", error: error.message })
  }
}

/**
 * DELETE PRODUCT
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid product id" })
    }

    const product = await Product.findByIdAndDelete(req.params.id)

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" })
    }

    res.status(200).json({ success: true, message: "Product deleted successfully" })
  } catch (error) {
    console.error("Delete Product Error:", error)
    res.status(500).json({ success: false, message: "Server error while deleting product" })
  }
}
