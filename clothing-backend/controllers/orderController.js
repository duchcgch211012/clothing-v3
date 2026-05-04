import mongoose from "mongoose"
import Order from "../models/OrderModels.js"
import Product from "../models/ProductModels.js"

const ALLOWED_STATUS = ["pending", "processing", "shipped", "delivered", "cancelled"]

export const createOrder = async (req, res) => {
  try {
    const { products = [], shippingAddress, phone } = req.body

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, message: "Order must contain at least one product" })
    }

    if (!shippingAddress?.trim()) {
      return res.status(400).json({ success: false, message: "Shipping address is required" })
    }

    if (!phone?.trim()) {
      return res.status(400).json({ success: false, message: "Phone number is required" })
    }

    const productIds = products.map(item => item.product).filter(id => mongoose.Types.ObjectId.isValid(id))
    if (productIds.length !== products.length) {
      return res.status(400).json({ success: false, message: "Invalid product id in order" })
    }

    const dbProducts = await Product.find({ _id: { $in: productIds } })
    const dbProductMap = new Map(dbProducts.map(product => [product._id.toString(), product]))

    const orderItems = []
    let totalPrice = 0
    const stockOperations = []

    for (const item of products) {
      const dbProduct = dbProductMap.get(item.product)
      const quantity = Math.max(1, Number(item.quantity) || 1)

      if (!dbProduct) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.name || item.product}` })
      }

      if (dbProduct.stock < quantity) {
        return res.status(400).json({ success: false, message: `Not enough stock for ${dbProduct.name}` })
      }

      const unitPrice = dbProduct.discount > 0
        ? Math.round(dbProduct.price * (1 - dbProduct.discount / 100))
        : dbProduct.price

      totalPrice += unitPrice * quantity

      orderItems.push({
        product: dbProduct._id,
        name: dbProduct.name,
        price: unitPrice,
        quantity,
        size: item.size || "",
        color: item.color || "",
      })

      stockOperations.push({
        updateOne: {
          filter: { _id: dbProduct._id, stock: { $gte: quantity } },
          update: { $inc: { stock: -quantity, sold: quantity } },
        },
      })
    }

    const stockResult = await Product.bulkWrite(stockOperations)
    if (stockResult.modifiedCount !== products.length) {
      return res.status(409).json({
        success: false,
        message: "Stock changed while ordering. Please review your cart.",
      })
    }

    const createdOrder = await Order.create({
      user: req.user.id,
      products: orderItems,
      totalPrice, 
      shippingAddress: shippingAddress.trim(),
      phone: phone.trim(),
    })

    const populated = await Order.findById(createdOrder._id)
      .populate("user", "username email")
      .populate("products.product", "name image")

    res.status(201).json({ success: true, message: "Order created successfully", data: populated })
  } catch (error) {
    console.error("Create Order Error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while creating order",
    })
  }
}

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("products.product", "name image")
      .sort({ createdAt: -1 })

    res.json({ success: true, count: orders.length, data: orders })
  } catch (error) {
    console.error("Get My Orders Error:", error)
    res.status(500).json({ success: false, message: "Server error while fetching your orders" })
  }
}
export const getMyOrderById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid order id" })
    }
 
    const order = await Order.findById(req.params.id)
      .populate("products.product", "name image")
 
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" })
    }
 
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "You are not authorized to view this order" })
    }
 
    res.json({ success: true, data: order })
  } catch (error) {
    console.error("Get My Order By Id Error:", error)
    res.status(500).json({ success: false, message: "Server error while fetching order" })
  }
}
 
/**
 * CANCEL ORDER (owner only, only when status = pending)
 * @route   PATCH /api/orders/my/:id/cancel
 * @access  Private
 */
export const cancelMyOrder = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid order id" })
    }
 
    const order = await Order.findById(req.params.id)
 
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" })
    }
 
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "You are not authorized to cancel this order" })
    }
 
    if (order.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending orders can be cancelled",
      })
    }
 
    // Hoàn lại stock cho từng sản phẩm
    const restoreOperations = order.products.map(item => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { stock: item.quantity, sold: -item.quantity } },
      },
    }))
 
    await Product.bulkWrite(restoreOperations)
 
    order.status = "cancelled"
    await order.save()
 
    const populated = await Order.findById(order._id)
      .populate("products.product", "name image")
 
    res.json({ success: true, message: "Order cancelled successfully", data: populated })
  } catch (error) {
    console.error("Cancel My Order Error:", error)
    res.status(500).json({ success: false, message: "Server error while cancelling order" })
  }
}
 
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "username email")
      .populate("products.product", "name image")
      .sort({ createdAt: -1 })

    res.json({ success: true, count: orders.length, data: orders })
  } catch (error) {
    console.error("Get Orders Error:", error)
    res.status(500).json({ success: false, message: "Server error while fetching orders" })
  }
}

export const updateOrder = async (req, res) => {
  try {
    const { status } = req.body

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid order id" })
    }

    if (status && !ALLOWED_STATUS.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid order status" })
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate("user", "username email")
      .populate("products.product", "name image")

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" })
    }

    res.json({ success: true, message: "Order updated successfully", data: order })
  } catch (error) {
    console.error("Update Order Error:", error)
    res.status(500).json({ success: false, message: "Server error while updating order" })
  }
}
