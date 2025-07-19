// backend/routes/orders.js

// Use import for express in ES Modules
import express from 'express';

// Use named imports for controller functions from orderController.js
// Ensure the .js extension is used for local file imports in ES Modules
import {
  placeOrder,
  verifyOrder,
  // Keep these only if you still use them for other payment methods
  createPaymentOrder,
  verifyPaymentAndCreateOrder,
  getUserOrders,
  getOrder
} from '../controllers/orderController.js'; // Added .js extension

// Use import for middleware (ensure .js extension)
import { protect } from '../middleware/auth.js'; // Assuming auth.js is also an ES Module

const router = express.Router();

// All routes are protected
router.use(protect);

// Existing routes (if still needed for other payment methods or general order management)
router.post('/create-payment', createPaymentOrder);
router.post('/verify-payment', verifyPaymentAndCreateOrder);

// New Razorpay specific routes
router.post('/place', placeOrder); // Endpoint to create Razorpay order
router.post('/verify', verifyOrder); // Endpoint to verify Razorpay payment

router.get('/my-orders', getUserOrders);
router.get('/:id', getOrder);

// Export the router using default export in ES Modules
export default router;
