import axios from "axios";

const AUTH_KEY = process.env.APITxT_AUTH_KEY;

export const sendOTP = async ({ mobile, otp }) => {
  try {
    const response = await axios.get(
      "https://apitxt.com/api/sendOTP",
      {
        params: {
          authkey: AUTH_KEY,
          mobile: `91${mobile}`,
          otp:otp,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "APITxt OTP Error:",
      error.response?.data || error.message
    );
    throw error.message;
  }
};