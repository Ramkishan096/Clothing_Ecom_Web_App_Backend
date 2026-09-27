import jwt from "jsonwebtoken";
import User from "../Models/auth.model.js";

export const verifyToken = async (req, res, next) => {
  console.log("Protect middleware called...");
  try {
    // console.log("Cookies in request:", req.cookies);
    // 1. Get token from cookies
    const token = req.cookies.token;
    // console.log("Token from cookies:", token);

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, please login" });
    }
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    // 3. Find user and attach to request (excluding password)
    req.user = await User.findOne({ userId: decoded.id }).select("-password");

    if (!req.user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    console.log("User found and attached to request:", req.user);

    next(); // Move to the next controller
  } catch (error) {
    res
      .status(401)
      .json({ success: false, message: "Token failed, session expired" });
  }
};

export const isAdmin = (req, res, next) => {
  console.log("hit is Admin function allow is roll..");
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, please login",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin only.",
    });
  }

  next();
};
