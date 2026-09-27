import axios from "axios";

/**
 * Verify Bank Account via Razorpay Penny Drop
 * @param {Object} payload
 * @param {string} payload.account_number
 * @param {string} payload.ifsc
 * @param {string} payload.name
 * 
 */

import { razorpay } from "./razorpay.authCheck.js";

export const verifyBankAccount = async (account_number, ifsc, name ) => {
    console.log("account_number:",account_number,"ifsc:",ifsc,"name:",name)
  try {
    // 🔹 Validation
    if (!account_number || !ifsc || !name) {
      throw new Error("Account number, IFSC, and name are required");
    }

    // 🔹 Razorpay Request Body
    const requestBody = {
      account_number:"2323230035226250",
      fund_account: {
        account_type: "bank_account",
        bank_account: {
          name,
          ifsc,
          account_number,
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
      }
    );

    const data = response.data;

    if (data.status !== "completed") {
      return {
        success: false,
        message: "Bank verification failed",
        raw: data,
      };
    }

    const verifiedName =
      data.fund_account?.bank_account?.name || name;

    return {
      success: true,
      message: "Bank account verified",
      data: {
        method: "bank",
        account_number,
        ifsc,
        name: verifiedName,
      },
    };

  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.error?.description ||
        error.message ||
        "Bank verification failed",
      error: error.response?.data || null,
    };
  }
};