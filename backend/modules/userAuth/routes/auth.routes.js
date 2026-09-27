// auth.routes.js - User Authentication Routes
import express from "express";
import {
  initRegister,
  verifyOtp,
  completeRegister,
  login,
  verifyLoginOtp,
  forgetPassword,
  resetPassword,
  getProfile,
  logout,
  addAddress,
  updateAddress,
  updateProfile,
  adminCheck,
  adminLogin
} from "../Controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { authLimiter, otpLimiter } from "../middlewares/rateLimiter.js";
import { resendOtp, sendOtp, verifyOTP } from "../Controllers/otp.controller.js";


const router = express.Router();



// --- Public Routes (Anyone can access) ---

// 1. Register a new user
router.post("/register/init",otpLimiter, initRegister);
router.post("/register/verify-otp", authLimiter, verifyOtp);
router.post("/register/complete", completeRegister);

// 2. Login user and get Token password or OTP
router.post("/login/method", authLimiter, login);

router.post("/login/verify-otp", otpLimiter, verifyLoginOtp);

// 3. Request password 
router.post("/forget-password",otpLimiter,forgetPassword);

// 4. Set a new password using reset token
router.put("/reset-password",authLimiter, resetPassword);


// --- verifyToken Routes (Login required) ---

// 5. Get current user profile (Uses Middleware)
router.get("/profile", verifyToken, getProfile);
router.post("/profile/update",verifyToken,updateProfile)
// 6. Logout user
router.post("/logout", verifyToken, logout);


// Addressing 
router.put("/profile/address", verifyToken,addAddress)
router.put("/profile/address/:addressId", verifyToken,updateAddress)


// otp route
router.post("/send-otp", otpLimiter,sendOtp)
router.post("/verify-otp", authLimiter, verifyOTP);
router.post("/resend-otp", otpLimiter, resendOtp);



// Admin routes
router.post('/admin/check', adminCheck);
router.post('/admin/login', adminLogin);

export default router; 