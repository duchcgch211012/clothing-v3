import express from "express"
import {
  createCategory,
  getCategories,
  deleteCategory
} from "../controllers/categoryController.js"

import { protect } from "../middleware/authMiddleware.js"
import { isAdmin } from "../middleware/roleMiddleware.js"

const router = express.Router()

router.get("/", getCategories)
router.post("/", protect, isAdmin, createCategory)
router.delete("/:id", protect, isAdmin, deleteCategory)

export default router