import Order from "../models/OrderModels.js"

export const createOrder = async (req, res) => {
  const order = await Order.create({
    ...req.body,
    user: req.user.id
  })
  res.json(order)
}

export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
  res.json(orders)
}

export const getOrders = async (req, res) => {
  const orders = await Order.find()
  .populate("user")
  .populate("products.product")

  res.json(orders)
}

export const updateOrder = async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  )
  res.json(order)
}