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

        await userModel.findByIdAndUpdate(userId, { cartData: {} });

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
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID
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

const verifyOrder = async (req, res) => {
    const { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    try {
        const order = await orderModel.findOne({ 'paymentInfo.razorpayOrderId': orderId });

        if (!order) {
            console.log("Order not found in DB for Razorpay Order ID:", orderId);
            return res.json({ success: false, message: "Order not found or already processed." });
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            console.log("SIGNATURE MATCHED! Updating payment info.");
            order.paymentInfo.razorpayPaymentId = razorpay_payment_id;
            order.paymentInfo.razorpaySignature = razorpay_signature;
            order.paymentInfo.status = "completed"; // Payment info status is completed
            order.payment = true; // Overall payment status is true

            // CRITICAL CHANGE: REMOVE order.status = "confirmed";
            // The order status should remain "Food Processing" from initial creation
            // unless verification fails.
            // order.status = "confirmed"; // <--- REMOVE THIS LINE

            await order.save();

            res.json({ success: true, message: "Payment Verified and Order Placed" });
        } else {
            console.log("SIGNATURE MISMATCH! Updating order status to failed.");
            console.log("Expected:", expectedSignature);
            console.log("Received:", razorpay_signature);
            order.paymentInfo.status = "failed";
            order.status = "failed"; // Set overall status to failed if verification fails
            order.payment = false;
            await order.save();

            res.json({ success: false, message: "Payment Verification Failed" });
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

//listing orders for admin Panel,this api not working
const listOrders = async (req,res) =>{
    try {
        const orders = await orderModel.find({});
        res.json({success:true,data:orders})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
        
    }

}

//api for updating order status
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
