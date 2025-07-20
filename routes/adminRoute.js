import express from 'express';
import { adminLogin } from '../controllers/adminController.js'; // Import the adminLogin controller

const adminRouter = express.Router();

// Admin Login endpoint
adminRouter.post('/login', adminLogin);

export default adminRouter;
