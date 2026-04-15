import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },

      name: {
        type: String,
        required: true
      },

      price: {
        type: Number,
        required: true
      },

      quantity: {
        type: Number,
        required: true,
        min: 1
      },

      size: {
        type: String,
        default: ""
      },

      color: {
        type: String,
        default: ""
      }
    }
  ],

  totalPrice: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending"
  },

  shippingAddress: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    required: true
  }

}, { timestamps: true })

export default mongoose.model("Order", orderSchema)