import axios from "axios";
import { razorpay } from "./razorpay.authCheck.js";

/**
 * Verify UPI ID via Razorpay
 * @param {Object} payload
 * @param {string} payload.upi_id
 */
export const verifyUpiId = async (upi_id) => {
    console.log("upi id",upi_id)
  try {
    // 🔹 Validation
    if (!upi_id) {
      throw new Error("UPI ID is required");
    }

    // 🔹 Razorpay Request
    const requestBody = {
      account_number: "2323230035226250", // required dummy
      fund_account: {
        account_type: "vpa",
        vpa: {
          address: upi_id,
        },
      },
    };

    const response = await axios.post(
      "https://api.razorpay.com/v1/fund_accounts/validations",
      requestBody,
      {
        auth: {
          username: razorpay.key_id,
          password: razorpay.key_secret,
        },
        timeout: 7000,
      },
    );

    const data = response.data;

    if (data.status !== "completed") {
      return {
        success: false,
        message: "UPI verification failed",
        raw: data,
      };
    }

    return {
      success: true,
      message: "UPI ID verified",
      data: {
        method: "upi",
        upi_id,
      },
    };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.error?.description ||
        error.message ||
        "UPI verification failed",
      error: error.response?.data || null,
    };
  }
};