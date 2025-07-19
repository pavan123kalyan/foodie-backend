// backend/routes/orderRoute.js

import express from 'express';
import authMiddleware from '../middleware/auth.js'; // User authentication middleware
import { placeOrder, verifyOrder, getUserOrders, listOrders, updateStatus } from "../controllers/orderController.js";

const router = express.Router();

// ADMIN ROUTES (These should ideally be protected by a separate adminAuthMiddleware)
// For quick testing, placing them before user authMiddleware.
router.get('/list', listOrders); // Admin: List all orders
router.post("/status", updateStatus); // <--- CRITICAL CHANGE: Admin: Update order status (moved here)

// USER ROUTES - All routes below this line are protected by authMiddleware
router.use(authMiddleware);

// User Order creation and verification
router.post("/place", placeOrder);
router.post("/verify", verifyOrder);

// Route to get a specific user's orders (user frontend)
router.get("/my-orders", getUserOrders);

export default router;
