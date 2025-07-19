// backend/controllers/cartController.js

import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";

// @desc    Add food item to user cart
// @route   POST /api/cart/add
// @access  Private (requires authMiddleware)
const addToCart = async (req, res) => {
    try {
        // Read userId from req.user._id
        const userId = req.user._id; // <--- CRITICAL CHANGE: Get userId from req.user._id
        if (!userId) {
            return res.status(401).json({ success: false, message: "Not authorized, user ID missing." });
        }

        let userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({ success: false, message: "User not found." });
        }

        let cartData = userData.cartData;
        if (!cartData[req.body.itemId]) {
            cartData[req.body.itemId] = 1;
        } else {
            cartData[req.body.itemId] += 1;
        }
        await userModel.findByIdAndUpdate(userId, { cartData }); // Use userId here
        res.json({ success: true, message: "Added To Cart" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

// @desc    Remove food item from user cart
// @route   POST /api/cart/remove
// @access  Private (requires authMiddleware)
const removeFromCart = async (req, res) => {
    try {
        // Read userId from req.user._id
        const userId = req.user._id; // <--- CRITICAL CHANGE: Get userId from req.user._id
        if (!userId) {
            return res.status(401).json({ success: false, message: "Not authorized, user ID missing." });
        }

        let userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({ success: false, message: "User not found." });
        }

        let cartData = userData.cartData;
        if (cartData[req.body.itemId] > 0) {
            cartData[req.body.itemId] -= 1;
        }
        await userModel.findByIdAndUpdate(userId, { cartData }); // Use userId here
        res.json({ success: true, message: "Removed From Cart" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

// @desc    Get user cart data
// @route   POST /api/cart/get
// @access  Private (requires authMiddleware)
const getCart = async (req, res) => {
    try {
        // Read userId from req.user._id
        const userId = req.user._id; // <--- CRITICAL CHANGE: Get userId from req.user._id
        if (!userId) {
            console.log("getCart: Not authorized, userId missing from req.user.");
            return res.status(401).json({ success: false, message: "Not authorized, user ID missing." });
        }
        console.log("getCart: Received userId:", userId);

        let userData = await userModel.findById(userId);

        if (!userData) {
            console.log("getCart: User not found for userId:", userId);
            return res.json({ success: false, message: "User not found or not logged in." });
        }

        let cartData = userData.cartData;
        console.log("getCart: Retrieved cartData:", cartData);

        res.json({ success: true, cartData });
    } catch (error) {
        console.log("Error in getCart:", error);
        res.json({ success: false, message: "Error" });
    }
};

export { addToCart, removeFromCart, getCart };
