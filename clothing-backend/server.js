import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cors from "cors"

import { protect } from "./middleware/authMiddleware.js"
import { isAdmin } from "./middleware/roleMiddleware.js"

import authRoutes from "./routes/authRoutes.js"
import productRoutes from "./routes/productRoutes.js"
import categoryRoutes from "./routes/categoryRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5001
const MONGO_URI = process.env.MONGO_URI

const allowedOrigins = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error(`CORS blocked origin: ${origin}`))
  },
  credentials: true,
}))
app.use(express.json({ limit: "2mb" }))

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Clothing Store API is running",
    version: "1.0.0",
  })
})

app.get("/health", (req, res) => {
  const mongoState = mongoose.connection.readyState
  res.status(mongoState === 1 ? 200 : 503).json({
    success: mongoState === 1,
    service: "clothing-backend",
    database: mongoState === 1 ? "connected" : "not_connected",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
})

app.get("/api/test", protect, (req, res) => {
  res.json({ success: true, message: "Protected route", user: req.user })
})

app.get("/api/admin", protect, isAdmin, (req, res) => {
  res.json({ success: true, message: "Welcome admin" })
})

app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/orders", orderRoutes)

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` })
})

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err)
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  })
})

if (!MONGO_URI) {
  console.error("Missing MONGO_URI environment variable")
  process.exit(1)
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected")
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch(err => {
    console.error("MongoDB connection failed:", err.message)
    process.exit(1)
  })
