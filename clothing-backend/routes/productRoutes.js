import express from "express"
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct
} from "../controllers/productController.js"

import { protect } from "../middleware/authMiddleware.js"
import { isAdmin } from "../middleware/roleMiddleware.js"

const router = express.Router()

router.get("/", getProducts)
router.get("/:id", getProduct)

router.post("/", protect, isAdmin, createProduct)
router.put("/:id", protect, isAdmin, updateProduct)
router.delete("/:id", protect, isAdmin, deleteProduct)

export default router