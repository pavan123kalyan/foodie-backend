        // backend/controllers/adminController.js

        import jwt from 'jsonwebtoken'; // Import jwt
        // No need for userModel or other specific models here, as we're checking against ENV

        const adminLogin = async (req, res) => {
            const { username, password } = req.body;

            const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
            const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
            const JWT_SECRET = process.env.JWT_SECRET; // Get JWT_SECRET from env

            if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !JWT_SECRET) {
                console.error("ADMIN_USERNAME, ADMIN_PASSWORD, or JWT_SECRET not set in backend .env file!");
                return res.status(500).json({ success: false, message: "Server configuration error." });
            }

            try {
                if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
                    // Generate admin-specific JWT
                    // You can use a static ID for admin if not from DB, or 'admin' string
                    const adminPayload = { id: 'admin_user_id_static', role: 'admin' }; // Example payload
                    const token = jwt.sign(adminPayload, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour

                    res.json({ success: true, message: "Admin Login Successful", token }); // Send token back
                } else {
                    res.json({ success: false, message: "Invalid Admin Credentials" });
                }
            } catch (error) {
                console.error("Error during admin login:", error);
                res.json({ success: false, message: "Server Error during login" });
            }
        };

        export { adminLogin };
        