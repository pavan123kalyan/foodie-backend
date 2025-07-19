// backend/config/razorpay.js

// Use import for the Razorpay SDK in ES Modules
import Razorpay from 'razorpay';

// Initialize Razorpay with your API keys from environment variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Export the initialized Razorpay instance using default export in ES Modules
export default razorpay;
