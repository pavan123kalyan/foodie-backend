// backend/middleware/adminAuth.js

import jwt from "jsonwebtoken";

const adminAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log("AdminAuth: No token or invalid format provided.");
        return res.status(401).json({ success: false, message: "Not Authorized, Admin Token Missing or Invalid Format" });
    }

    const token = authHeader.split(' ')[1]; // Extract the token

    try {
        // Verify the token using the JWT_SECRET from .env
        // In a real scenario, you might have a different secret for admin tokens
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);

        // Optional: Check if the decoded token has an 'admin' role or specific admin ID
        // if (token_decode.role !== 'admin') {
        //     console.log("AdminAuth: Token is not for an admin user.");
        //     return res.status(403).json({ success: false, message: "Forbidden, Not an Admin" });
        // }

        // Attach decoded admin ID to request for further use (e.g., req.adminId)
        req.adminId = token_decode.id; // Assuming your admin token payload has an 'id'
        console.log("AdminAuth: Token decoded. Admin ID attached:", req.adminId);
        next(); // Proceed to the next middleware/route handler

    } catch (error) {
        console.error("AdminAuth: Error verifying token:", error);
        return res.status(401).json({ success: false, message: "Not Authorized, Invalid Admin Token" });
    }
};

export default adminAuthMiddleware;
