import express from "express"
import {
  createOrder,
  getMyOrders,
  getOrders,
  updateOrder,
  getMyOrderById,
  cancelMyOrder
} from "../controllers/orderController.js"

import { protect } from "../middleware/authMiddleware.js"
import { isAdmin } from "../middleware/roleMiddleware.js"

const router = express.Router()

router.post("/", protect, createOrder)
router.get("/my", protect, getMyOrders)

router.get("/my/:id", protect, getMyOrderById)
router.patch("/my/:id/cancel", protect, cancelMyOrder)

router.get("/", protect, isAdmin, getOrders)
router.put("/:id", protect, isAdmin, updateOrder)

export default router