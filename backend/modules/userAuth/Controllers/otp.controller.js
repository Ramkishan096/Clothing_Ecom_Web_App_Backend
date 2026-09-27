import { resendOtpService, sendOtpService, verifyOtpService } from "../Services/auth.service.js";

// 1️⃣ INIT REGISTER (Send OTP)
export const sendOtp = async (req, res) => {
  try {
    console.log("api hit Send OTP Called...");

    const { mobile } = req.body;
    console.log("Received mobile:", mobile);

    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is required",
        data: null,
        error: "ValidationError",
      });
    }   
    console.log("Sending OTP to:", mobile);

    const otp = await sendOtpService(mobile);

    return res
      .status(200)
      .json({ success: true, message: "OTP sent", data: otp});
  } catch (err) {
    console.error("Error sending OTP:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      data: null,
      error: err.message,
    });
  }
};

// 2️⃣ VERIFY OTP
export const verifyOTP = async (req, res) => {
  console.log("api hit Verify OTP Called...============");
  try {
    const { mobile, otp } = req.body;

    const verifyRes = await verifyOtpService(mobile, otp);

    res.status(200).json({
      success: true,
      verified: verifyRes.verified,
      message: verifyRes.message,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Failed to verify OTP",
      data: null,
      error: err.message,
    });
  }
};



export const resendOtp = async (req, res) => {
  try {
    console.log("api hit Resend OTP Called...");
    const { mobile } = req.body;
    const otp= await resendOtpService(mobile);
    return res
      .status(200)
      .json({ success: true, message: "OTP Resent successfully", data: otp });
  } catch (err) {
    console.error("Error resending OTP:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
      data: null,
      error: err.message,
    });
  }
};
