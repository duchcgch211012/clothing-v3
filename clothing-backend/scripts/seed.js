import dotenv from "dotenv"
import mongoose from "mongoose"
import bcrypt from "bcryptjs"

import User from "../models/UserModels.js"
import Category from "../models/CategoryModels.js"
import Product from "../models/ProductModels.js"

dotenv.config()

const MONGO_URI = process.env.MONGO_URI
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@clothing.local"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123456"

const categories = [
  { name: "Áo nam", description: "Áo thun, áo sơ mi và áo khoác nam" },
  { name: "Áo nữ", description: "Các mẫu áo nữ trẻ trung, dễ phối đồ" },
  { name: "Quần", description: "Quần jeans, kaki và quần short" },
  { name: "Phụ kiện", description: "Túi, mũ và phụ kiện thời trang" },
]

const productSeed = [
  {
    name: "Áo thun basic cotton",
    category: "Áo nam",
    price: 199000,
    description: "Áo thun cotton mềm, form regular, phù hợp mặc hằng ngày.",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    stock: 40,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Trắng", "Đen", "Xanh navy"],
    rating: 4.6,
    sold: 128,
    discount: 10,
    isHot: true,
  },
  {
    name: "Sơ mi linen nữ",
    category: "Áo nữ",
    price: 329000,
    description: "Sơ mi linen thoáng mát, phong cách tối giản và thanh lịch.",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80",
    stock: 25,
    sizes: ["S", "M", "L"],
    colors: ["Be", "Trắng"],
    rating: 4.8,
    sold: 86,
    discount: 0,
    isHot: true,
  },
  {
    name: "Quần jeans straight fit",
    category: "Quần",
    price: 459000,
    description: "Quần jeans straight fit dễ mặc, chất denim bền và đứng form.",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80",
    stock: 30,
    sizes: ["28", "29", "30", "31", "32"],
    colors: ["Xanh nhạt", "Xanh đậm"],
    rating: 4.4,
    sold: 74,
    discount: 15,
    isHot: false,
  },
  {
    name: "Túi tote canvas",
    category: "Phụ kiện",
    price: 149000,
    description: "Túi tote canvas dày dặn, tiện cho đi học, đi làm và mua sắm.",
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80",
    stock: 60,
    sizes: ["Free size"],
    colors: ["Kem", "Đen"],
    rating: 4.7,
    sold: 203,
    discount: 5,
    isHot: true,
  },
]

async function seed() {
  if (!MONGO_URI) throw new Error("Missing MONGO_URI")

  await mongoose.connect(MONGO_URI)
  console.log("Connected to MongoDB")

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10)
  await User.findOneAndUpdate(
    { email: ADMIN_EMAIL.toLowerCase() },
    {
      username: "Admin",
      email: ADMIN_EMAIL.toLowerCase(),
      password: hashedPassword,
      role: "admin",
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )
  console.log(`Admin ready: ${ADMIN_EMAIL}`)

  const categoryMap = new Map()
  for (const category of categories) {
    const doc = await Category.findOneAndUpdate(
      { name: category.name },
      category,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    categoryMap.set(category.name, doc._id)
  }
  console.log(`Categories ready: ${categoryMap.size}`)

  for (const product of productSeed) {
    const categoryId = categoryMap.get(product.category)
    await Product.findOneAndUpdate(
      { name: product.name },
      { ...product, category: categoryId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
  }
  console.log(`Products ready: ${productSeed.length}`)

  await mongoose.disconnect()
  console.log("Seed completed")
}

seed().catch(async (error) => {
  console.error("Seed failed:", error)
  await mongoose.disconnect().catch(() => {})
  process.exit(1)
})
