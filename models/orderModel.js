import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, default: "Food Processing" },
    date: { type: Date, default: Date.now() },
    payment: { type: Boolean, default: false },
    // Ensure paymentInfo is explicitly defined as an object in your schema
    paymentInfo: {
        method: { type: String, enum: ["razorpay", "cod"], default: "razorpay" },
        razorpayOrderId: { type: String }, // Make sure it's a String type
        razorpayPaymentId: { type: String },
        razorpaySignature: { type: String },
        status: { type: String, enum: ["pending", "completed", "failed", "refunded"], default: "pending" },
    }
}, { minimize: false, timestamps: true }); // Added timestamps for better tracking

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;
