import Razorpay from "razorpay";
import crypto from "crypto";
import { razorpay } from "./razorpay.authCheck.js";

/**
 * Create Razorpay Order
 */
export const createRazorpayOrder = async ({ amount, notes = {} }) => {
  try {
    console.log("hit create Razorpay order payment....")
    if (!amount || isNaN(amount)) {
      throw new Error("Invalid amount");
    }

    const amountInPaise = Math.round(Number(amount) * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes,
    };

    const order = await razorpay.orders.create(options);

    return {
      success: true,
      message: "Razorpay order created successfully",
      data: order,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      data: null,
      error: error.message,
    };
  }
};

/**
 * Verify Razorpay Payment
 */
export const verifyRazorpayPayment = async ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) => {
  try {
    console.log("hit verifyRaxzorpayPayment...")
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error("Missing payment fields");
    }
    
    console.log("-------------------11111111111")
    // 🔹 Fetch payment from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (payment.status !== "captured") {
      return {
        success: false,
        message: "Payment not captured",
        data:null,
        error: "Payment status is " + payment.status,
      };
    }

    console.log("=====================2")
    // 🔹 Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", razorpay.key_secret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return {
        success: false,
        message: "Invalid signature",
        data:null,
        error: "Expected signature does not match Razorpay signature",
      };
    }

    return {
      success: true,
      message: "Payment verified successfully",
      data: payment,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      data:null,
      error: error.message,
    };
  }
};