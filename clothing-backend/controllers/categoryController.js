import Category from "../models/CategoryModels.js"
import Product from "../models/ProductModels.js"

// CREATE
export const createCategory = async (req, res) => {
  try {
    let { name } = req.body

    name = name?.trim()

    // 🔥 Validate
    if (!name) {
      return res.status(400).json({ message: "Tên danh mục không được để trống" })
    }

    if (name.length < 2) {
      return res.status(400).json({ message: "Tên danh mục phải >= 2 ký tự" })
    }

    // 🔥 Check trùng
    const existing = await Category.findOne({ name })
    if (existing) {
      return res.status(400).json({ message: "Danh mục đã tồn tại" })
    }

    const category = await Category.create({
      ...req.body,
      name
    })

    res.status(201).json(category)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getCategories = async (req, res) => {
  const categories = await Category.find()
  res.json(categories)
}
export const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id

    // 🔥 Check tồn tại
    const category = await Category.findById(categoryId)
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" })
    }

    // 🔥 Check có product không
    const products = await Product.find({ category: categoryId })

    if (products.length > 0) {
      return res.status(400).json({
        message: "Không thể xoá vì danh mục đang chứa sản phẩm"
      })
    }

    await Category.findByIdAndDelete(categoryId)

    res.json({ message: "Xoá danh mục thành công" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}