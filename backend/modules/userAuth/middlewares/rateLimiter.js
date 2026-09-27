import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// 🔥 Global limiter (sabhi APIs ke liye)
export const globalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 10 min
  max: 200, // per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Too many requests, please try again later",
      data: null,
      error: "TooManyRequests",
    });
  },
});

// 🔐 Auth / Login limiter (strict)
export const authLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours 
  max: 10,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Too many login attempts, try later after 24 hours",
      data: null,
      error: "TooManyRequests",
    });
  },
});

// 📱 OTP limiter (very strict)
export const otpLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24
  max: 20,
  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req); // ✅ safe IP
    const identifier = req.body.identifier || "";
    return `${ip}-${identifier}`;
  },
  handler: (req, res) => {
    console.log("OTP request limit exceeded for IP:", req.ip);
    return res.status(429).json({
      success: false,
      message: "Too many OTP requests, wait 24 hours",
      data: null,
      error: "TooManyRequests",
    });
  },
});
