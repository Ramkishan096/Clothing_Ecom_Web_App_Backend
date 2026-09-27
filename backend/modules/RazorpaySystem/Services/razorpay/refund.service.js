import axios from "axios";
import { razorpay } from "./razorpay.authCheck.js";

// export const createRefund = async (paymentId, amount, notes = {}) => {
//   console.log("Initiating refund for paymentId:", paymentId, "Amount:", amount);

export const refundToOriginalSource = async ({
  paymentId,
  amount,
  speed,
  reciept,
  notes,
}) => {
  console.log("Initiating refund for paymentId:", paymentId, "Amount:", amount, "Speed:", speed, "Receipt:", reciept, "Notes:", notes);

  try {
    // 🔐 Extract keys from existing razorpay instance
    const key_id = razorpay.key_id;
    const key_secret = razorpay.key_secret;

    const auth = Buffer.from(`${key_id}:${key_secret}`).toString("base64");

    const response = await axios.post(
      `https://api.razorpay.com/v1/payments/${paymentId}/refund`,
      {
        amount: amount * 100, // ₹ → paise
        speed,
        reciept,
        notes,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
      }
    );

    console.log("Refund Response:", response.data);

    return {
      success: true,
      data: response.data,
      message: "Refund initiated successfully",
    };
  } catch (error) {
    console.error(
      "Refund Error:",
      error?.response?.data || error.message
    );

    return {
      success: false,
      message:
        error?.response?.data?.error?.description ||
        error.message,
      data: null,
      error:error?.response?.data?.error || null
    };
  }
};

