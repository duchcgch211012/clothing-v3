import mongoose from "mongoose"

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  price: {
    type: Number,
    required: true,
    min: 0
  },

  description: {
    type: String,
    default: ""
  },

  image: {
    type: String,
    default: ""
  },

  images: [
    {
      type: String
    }
  ],

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },

  stock: {
    type: Number,
    default: 0
  },

  sizes: [
    {
      type: String
    }
  ],

  colors: [
    {
      type: String
    }
  ],

  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },

  sold: {
    type: Number,
    default: 0
  },

  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  isHot: {
    type: Boolean,
    default: false
  }

}, { timestamps: true })

export default mongoose.model("Product", productSchema)