// backend/controllers/orderController.js

import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import razorpay from '../config/razorpay.js';
import crypto from 'crypto';

const frontend_url = "http://localhost:5174";

const placeOrder = async (req, res) => {
    try {
        const userId = req.user._id;

        if (!userId) {
            console.log("placeOrder: Not authorized, userId missing from req.user.");
            return res.status(401).json({ success: false, message: "Not authorized, user ID missing." });
        }

        const initialOrderData = {
            userId: userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
            paymentInfo: {
                method: "razorpay",
                status: "pending",
                razorpayOrderId: "",
                razorpayPaymentId: "",
                razorpaySignature: ""
            },
            status: "Food Processing" // Ensure initial status is set here
        };

        const newOrder = new orderModel(initialOrderData);
        await newOrder.save();
        console.log("1. Order created in DB with MongoDB _id:", newOrder._id);

        // We will clear the cart only AFTER successful payment verification
        // await userModel.findByIdAndUpdate(userId, { cartData: {} }); // Moved this to verifyOrder success

        const options = {
            amount: req.body.amount * 100,
            currency: "INR",
            receipt: `order_rcptid_${newOrder._id}`,
            payment_capture: 1
        };

        const razorpayOrder = await razorpay.orders.create(options);
        console.log("2. Razorpay Order created with ID:", razorpayOrder.id);

        await orderModel.findByIdAndUpdate(
            newOrder._id,
            { 'paymentInfo.razorpayOrderId': razorpayOrder.id },
            { new: true }
        );
        console.log("3. Order updated in DB with Razorpay Order ID:", razorpayOrder.id);

        res.json({
            success: true,
            orderId: razorpayOrder.id, // This is the Razorpay Order ID
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID,
            mongoOrderId: newOrder._id // Send MongoDB _id to frontend for potential deletion
        });

    } catch (error) {
        console.error('Error placing order with Razorpay:', error);
        if (error.name === 'ValidationError') {
            console.error('Validation Error Details:', error.errors);
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: "Error placing order" });
    }
};

// @desc    Verify Razorpay payment (success or failure notification)
// @route   POST /api/order/verify
// @access  Private
const verifyOrder = async (req, res) => {
    const { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature, success, mongoOrderId } = req.body; // Added 'success' and 'mongoOrderId'

    try {
        // Find the order using either Razorpay Order ID or MongoDB _id
        let order;
        if (mongoOrderId) {
            order = await orderModel.findById(mongoOrderId); // Find by MongoDB ID if provided
        } else if (orderId) {
            order = await orderModel.findOne({ 'paymentInfo.razorpayOrderId': orderId }); // Fallback to Razorpay ID
        }

        if (!order) {
            console.log("Order not found in DB for verification (Razorpay ID:", orderId, "or Mongo ID:", mongoOrderId, ")");
            return res.json({ success: false, message: "Order not found or already processed." });
        }

        // --- CRITICAL: Handle direct failure notification vs. signature verification ---
        if (success === false) { // This means frontend explicitly sent a failure notification
            console.log("Received direct payment failure notification from frontend for order:", order._id);
            // Delete the order from DB if payment failed/cancelled
            await orderModel.findByIdAndDelete(order._id);
            console.log("Order deleted due to payment failure.");
            // No need to clear cart here, as it was not cleared on initial placeOrder
            return res.json({ success: true, message: "Payment failure recorded, order deleted." });
        }

        // If 'success' is not false, proceed with signature verification (for successful payments)
        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
            console.log("Missing Razorpay signature details for verification for order:", order._id);
            // Delete the order if details are incomplete for a successful verification attempt
            await orderModel.findByIdAndDelete(order._id);
            console.log("Order deleted due to incomplete verification details.");
            return res.json({ success: false, message: "Missing payment details for verification, order deleted." });
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            console.log("SIGNATURE MATCHED! Updating payment info for order:", order._id);
            order.paymentInfo.razorpayPaymentId = razorpay_payment_id;
            order.paymentInfo.razorpaySignature = razorpay_signature;
            order.paymentInfo.status = "completed";
            order.payment = true;
            order.status = "Food Processing"; // Ensure status remains "Food Processing"

            await order.save();

            // Clear the cart ONLY after successful payment and verification
            await userModel.findByIdAndUpdate(order.userId, { cartData: {} }); // Now clearing cart here

            res.json({ success: true, message: "Payment Verified and Order Placed" });
        } else {
            console.log("SIGNATURE MISMATCH! Deleting order due to failed verification for order:", order._id);
            // Delete the order if signature verification fails
            await orderModel.findByIdAndDelete(order._id);
            console.log("Order deleted due to signature mismatch.");
            return res.json({ success: false, message: "Payment Verification Failed, order deleted." });
        }
    } catch (error) {
        console.error('Error verifying Razorpay payment:', error);
        res.json({ success: false, message: "Error verifying payment" });
    }
};

const getUserOrders = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            console.log("getUserOrders: Not authorized, req.user._id missing.");
            return res.status(401).json({ success: false, message: "Not authorized, user ID missing." });
        }

        const orders = await orderModel.find({ userId: req.user._id })
            .sort({ date: -1 });

        res.json({ success: true, orders });
    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
};

const listOrders = async (req,res) =>{
    try {
        const orders = await orderModel.find({});
        res.json({success:true,data:orders})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

const updateStatus = async (req,res) =>{
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId,{status:req.body.status})
        res.json({success:true,message:"Status Updated"})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

export { placeOrder, verifyOrder, getUserOrders,listOrders,updateStatus};
