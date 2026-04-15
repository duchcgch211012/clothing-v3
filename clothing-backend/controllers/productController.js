import Product from "../models/ProductModels.js"

export const createProduct = async (req, res) => {
  try {
    const { name, price, category } = req.body

    if (!name || !price || !category) {
      return res.status(400).json("Missing required fields")
    }

    const product = await Product.create(req.body)
    res.json(product)
  } catch (error) {
    res.status(500).json(error.message)
  }
}

export const getProducts = async (req, res) => {
  try {
    const { hot } = req.query
    const filter = hot === "true" ? { isHot: true } : {}
    const products = await Product.find(filter).populate("category")
    res.json(products)
  } catch (error) {
    res.status(500).json(error.message)
  }
}

export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category")
    if (!product) return res.status(404).json("Product not found")
    res.json(product)
  } catch (error) {
    res.status(500).json(error.message)
  }
}

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    if (!product) return res.status(404).json("Product not found")
    res.json(product)
  } catch (error) {
    res.status(500).json(error.message)
  }
}

export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id)
    res.json("Deleted")
  } catch (error) {
    res.status(500).json(error.message)
  }
}