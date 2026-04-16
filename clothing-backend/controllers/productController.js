import Product from "../models/ProductModels.js"
import Category from "../models/CategoryModels.js"

// CREATE PRODUCT
export const createProduct = async (req, res) => {
  try {
    let { name, price, category } = req.body

    // 🔥 Trim dữ liệu
    name = name?.trim()

    // 🔥 Validate
    if (!name) {
      return res.status(400).json({ message: "Tên sản phẩm không được để trống" })
    }

    if (!price || isNaN(price) || price <= 0) {
      return res.status(400).json({ message: "Giá phải là số lớn hơn 0" })
    }

    if (!category) {
      return res.status(400).json({ message: "Vui lòng chọn danh mục" })
    }

    // 🔥 Check category tồn tại
    const categoryExists = await Category.findById(category)
    if (!categoryExists) {
      return res.status(400).json({ message: "Danh mục không tồn tại" })
    }

    // 🔥 Check trùng tên
    const existing = await Product.findOne({ name })
    if (existing) {
      return res.status(400).json({ message: "Sản phẩm đã tồn tại" })
    }

    const product = await Product.create({
      ...req.body,
      name,
      price: Number(price)
    })

    res.status(201).json(product)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// GET ALL PRODUCTS
export const getProducts = async (req, res) => {
  try {
    const { hot } = req.query

    const filter = hot === "true" ? { isHot: true } : {}

    const products = await Product.find(filter).populate("category")

    res.json(products)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// GET SINGLE PRODUCT
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category")

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" })
    }

    res.json(product)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  try {
    let { name, price, category } = req.body

    // 🔥 Validate nếu có truyền lên
    if (name && !name.trim()) {
      return res.status(400).json({ message: "Tên sản phẩm không hợp lệ" })
    }

    if (price && (isNaN(price) || price <= 0)) {
      return res.status(400).json({ message: "Giá không hợp lệ" })
    }

    if (category) {
      const categoryExists = await Category.findById(category)
      if (!categoryExists) {
        return res.status(400).json({ message: "Danh mục không tồn tại" })
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        name: name?.trim(),
        price: price ? Number(price) : undefined
      },
      { new: true }
    )

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" })
    }

    res.json(product)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" })
    }

    await Product.findByIdAndDelete(req.params.id)

    res.json({ message: "Xoá sản phẩm thành công" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}