    // backend/routes/cartRoute.js (Example)

    import express from 'express';
    import authMiddleware from '../middleware/auth.js'; // Import authMiddleware
    import { addToCart, removeFromCart, getCart } from '../controllers/cartController.js'; // Import cart controllers

    const cartRouter = express.Router();

    // Apply authMiddleware to all cart routes
    cartRouter.post("/add", authMiddleware, addToCart);
    cartRouter.post("/remove", authMiddleware, removeFromCart);
    cartRouter.post("/get", authMiddleware, getCart); // <--- Ensure authMiddleware is here

    export default cartRouter;
    