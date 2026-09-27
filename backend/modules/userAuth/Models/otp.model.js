import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  identifier: { type: String, required: true }, // email or mobile
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true }
});

export default mongoose.model("OTP", otpSchema);