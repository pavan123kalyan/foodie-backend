    // backend/routes/orderRoute.js

    import express from 'express';
    import authMiddleware from '../middleware/auth.js'; // User authentication middleware
    import adminAuthMiddleware from '../middleware/adminAuth.js'; // <--- NEW: Import adminAuthMiddleware
    import { placeOrder, verifyOrder, getUserOrders, listOrders, updateStatus } from "../controllers/orderController.js";

    const router = express.Router();

    // ADMIN ROUTES - PROTECTED BY ADMIN AUTH MIDDLEWARE
    router.get('/list', adminAuthMiddleware, listOrders); // <--- Apply adminAuthMiddleware here
    router.post("/status", adminAuthMiddleware, updateStatus); // <--- Apply adminAuthMiddleware here

    // USER ROUTES - All routes below this line are protected by authMiddleware
    router.use(authMiddleware);

    // User Order creation and verification
    router.post("/place", placeOrder);
    router.post("/verify", verifyOrder);

    // Route to get a specific user's orders (user frontend)
    router.get("/my-orders", getUserOrders);

    export default router;
    