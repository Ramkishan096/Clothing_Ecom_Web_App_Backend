import Razorpay from "razorpay";
import dotenv from "dotenv";
import crypto from "crypto";
import { verifyRazorpayPayment } from "../../RazorpaySystem/Services/razorpay/razorpay.service.js";

dotenv.config();

export const verifyPaymentMiddleware = async (req, res, next) => {
  try {
    console.log("hit verifyPaymentMiddleware...");
    const { payment_type } = req.body.OrderDetails || {};
    if (!payment_type) {
      return res.status(400).json({
        success: false,
        message: "payment_type is required",
        data:null,
        error:"feild missing payment_type"
      });
    }
    // COD
    if (payment_type?.toUpperCase() === "COD") {
      req.verifiedPayment = null;
      return next();
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    
    console.log("------------------1")
    const result = await verifyRazorpayPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });
    console.log("-------------2",result)
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    req.verifiedPayment = result.data;

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
