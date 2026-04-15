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

app.use(cors())
app.use(express.json())


app.get("/", (req, res) => {
    res.send("API running...")
})

app.get("/api/test", protect, (req, res) => {
    res.json({ message: "Protected route", user: req.user })
})

app.get("/api/admin", protect, isAdmin, (req, res) => {
    res.json("Welcome admin")
})


app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/orders", orderRoutes)


app.use((err, req, res, next) => {
    res.status(500).json({ message: err.message })
})


const PORT = process.env.PORT || 5001

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected")
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        })
    })
    .catch(err => console.log(err))