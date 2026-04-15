import Category from "../models/CategoryModels.js"

export const createCategory = async (req, res) => {
  const category = await Category.create(req.body)
  res.json(category)
}

export const getCategories = async (req, res) => {
  const categories = await Category.find()
  res.json(categories)
}

export const deleteCategory = async (req, res) => {
  await Category.findByIdAndDelete(req.params.id)
  res.json("Deleted")
}