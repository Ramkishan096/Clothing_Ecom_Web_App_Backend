import bcrypt from "bcryptjs";
import { generateToken } from "../userAuthUtils/token.util.js";
import User from "../Models/auth.model.js";
import {
  sendOtpService,
  verifyOtpService,
  registerUserService,
  setAuthCookie,
  addAddressService,
  updateAddressService,
  updateProfileService,
} from "../Services/auth.service.js";
import { hashPassword } from "../userAuthUtils/password.util.js";
import {
  isValidEmail,
  isValidMobile,
} from "../userAuthUtils/validationCheck.js";

// 1️⃣ INIT REGISTER (Send OTP)
export const initRegister = async (req, res) => {
  try {
    console.log("api hit Init Register Called...");

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

    // Check type
    let query = {};

    if (isValidMobile(mobile)) {
      query.mobile = mobile;
    } else {
      return res.status(422).json({
        success: false,
        message: "Invalid mobile format",
        data: null,
        error: "ValidationError",
      });
    }
    console.log("Checking existing user with query:", query);

    const userExists = await User.findOne(query);

    if (userExists) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
        data: null,
        error: "Conflict",
      });
    }
    console.log("Sending OTP to:", mobile);

    const otp = await sendOtpService(mobile);

    return res
      .status(200)
      .json({ success: true, message: "OTP sent", data: otp });
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
export const verifyOtp = async (req, res) => {
  console.log("api hit Verify OTP Called...");
  try {
    const { mobile, otp } = req.body;

    const verifyRes = await verifyOtpService(mobile, otp);

    res.status(200).json({
      success: true,
      verified: verifyRes.verified,
      message: verifyRes.message,
      nextStep: "COLLECT_USER_DETAILS",
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

// 3️⃣ COMPLETE REGISTRATION
export const completeRegister = async (req, res) => {
  console.log("api hit Complete Register Called...");
  try {
    const { mobile, firstName, lastName, password, confirmPassword } = req.body;
    console.log("reqbody for register user:", req.body);
    if (!mobile || !firstName || !lastName || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        data: null,
        error: "ValidationError",
      });
    }

    if (password !== confirmPassword)
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
        data: null,
        error: "ValidationError",
      });
    console.log("Registering user with mobile:", mobile);

    const response = await registerUserService({
      mobile,
      firstName,
      lastName,
      password,
    });
    console.log("User registered:", response.data.user);

    setAuthCookie(res, response.data.token); // Helper function to set cookie

    res.status(201).json({
      success: true,
      message: "Registration successful and logged in",
      data: response.data,
      user: response.data.user,
    });
  } catch (err) {
    console.error("Error during registration:", err.message);
    res.status(500).json({
      success: false,
      message: `Failed to register user: ${err.message}`,
      data: null,
      error: err.message,
    });
  }
};

//==================================================================================================================

// 4️⃣ LOGIN
export const login = async (req, res) => {
  console.log("api hit Login Called...");
  try {
    const { mobile, password, loginMethod } = req.body; // loginMethod: 'password' or 'otp'
    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is required",
        data: null,
        error: "ValidationError",
      });
    }
    const user = await User.findOne({ mobile: mobile }).select("+password");
    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
        error: "NotFound",
      });
    console.log("password login method:", loginMethod === "password");
    // FLOW 1: PASSWORD LOGIN
    if (loginMethod === "password") {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(401).json({ message: "Invalid credentials" });

      const token = generateToken(user.userId);
      console.log("token generated:", token);
      setAuthCookie(res, token); // Helper function to set cookie
      return res
        .status(200)
        .json({ success: true, message: "Login successful", data: user });
    }

    // FLOW 2: OTP LOGIN REQUEST
    const otp = await sendOtpService(mobile);
    res.status(200).json({ success: true, message: "OTP sent for login",data:otp });
  } catch (err) {
    res.status(500).json({ success:false,message:"OTP Send Failed...",error: err.message });
  }
};

// 5️⃣ VERIFY LOGIN OTP
export const verifyLoginOtp = async (req, res) => {
  console.log("api hit Verify Login OTP Called...");
  try {
    const { mobile, otp } = req.body;
    const identifier = String(mobile).trim().toLowerCase();
    console.log("Verifying OTP for:", identifier, "OTP:", otp);

    const resVerify = await verifyOtpService(identifier, otp);

    console.log("OTP verification response:", resVerify);

    if (!resVerify.verified) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
        data: null,
        error: "Invalid OTP",
      });
    }

    console.log("OTP verified for:", identifier);

    const user = await User.findOne({ mobile: identifier }).select("+password");

    const token = generateToken(user.userId);
    console.log("token generated:", token);
    setAuthCookie(res, token);

    res
      .status(200)
      .json({ success: true, message: "Login successful", data: user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 6️⃣ FORGET PASSWORD
export const forgetPassword = async (req, res) => {
  console.log("api hit Forget Password Called...");
  try {
    const { mobile } = req.body;
    const user = await User.findOne({ mobile: mobile }).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = await sendOtpService(mobile);
    res
      .status(200)
      .json({ success: true, message: "OTP sent for password reset",data:otp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 7️⃣ RESET PASSWORD (The actual update)
export const resetPassword = async (req, res) => {
  console.log("api hit Reset Password Called...");
  try {
    const { mobile, otp, newPassword, confirmPassword } = req.body;
    const cleanIdentifier = String(mobile).trim().toLowerCase();
    const cleanOtp = String(otp).trim();
    // 1. Basic Validation
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // 2. Verify OTP (Using your existing service)
    // This will throw an error if OTP is wrong or expired
    await verifyOtpService(cleanIdentifier, cleanOtp);

    // 3. Find User
    const user = await User.findOne({ mobile: cleanIdentifier }).select(
      "+password",
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    // 4. Hash and Update Password
    const hashed = await hashPassword(newPassword);
    user.password = hashed;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully. You can now login.",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: `Reset Password failed ${err.message}`,
      data: null,
      error: err.message,
    });
  }
};

// 8️⃣ GET PROFILE
export const getProfile = async (req, res) => {
  console.log("api hit Get Profile Called...");
  try {
    const user = req.user; // Set by protect middleware
    res
      .status(200)
      .json({
        success: true,
        message: "Profile retrieved successfully",
        data: user,
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const updateProfile = async(req,res)=>{
  try {
    console.log("hit api update profile...")
    const {first_name,last_name,email} = req.body;
    if(!first_name || !last_name){
      res.status(400).json({success:false,message:"please enter first Name and last Name..",data:null,error:"missign field...",})
    }   
    const user = req.user
    const profileUpdate = await updateProfileService(user.userId,first_name,last_name,email)
    console.log("profile updated:",profileUpdate)
    res.status(200).json({success:true,message:"profile update successfully",data:profileUpdate})
  } catch (error) {
     console.log("error while profile update:",error.message)
     res.status(500).json({
      success:false,
      message:error.message,
      data:null,
      error:"internall server error"
     })
  }
}

// 9️⃣ LOGOUT - Clear the cookie
export const logout = async (req, res) => {
  console.log("api hit Logout Called...");
  try {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addAddress = async (req, res) => {
  console.log("API Hit: Add Address....");

  try {
    const user = req.user;
    const { address, email } = req.body;

    const { street, city, state, pin_code, isDefault = false } = address;

    if (!street || !city || !state || !pin_code) {
      return res.status(400).json({
        success: false,
        message: "All address fields are required",
      });
    }

    const addresses = await addAddressService(user.userId, email, {
      street,
      city,
      state,
      pin_code,
      isDefault,
    });

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      addresses,
    });
  } catch (err) {
    console.error("Add Address Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const updateAddress = async (req, res) => {
  console.log("API Hit: Update Address....");
  try {
    const user = req.user;
    const { addressId } = req.params;
    const { address, email } = req.body;
    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: "Address ID is required",
      });
    }
    const result = await updateAddressService(user.userId, addressId, {
      street: address.street,
      city: address.city,
      state: address.state,
      pin_code: address.pin_code,
      isDefault: address.isDefault || false,
    },email);
    console.log("result update address:",result)
    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Update Address Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
      data:null,
      error: error.message,
    });
  }
};















// Admin Check - Check if user is admin
export const adminCheck = async (req, res) => {
  try {
    console.log("api hit admin check...")
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({success:false, message: 'Mobile number is required',data:null });
    }

    // Find user
    const user = await User.findOne({ mobile });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is admin
    if (!(user.role==="admin")) {
      return res.status(403).json({ message: 'You are not authorized as admin' });
    }
    console.log(user.role)

   const otp =  await sendOtpService(mobile)

    // For demo - return OTP
    res.status(200).json({
      success: true,
      message: 'Admin verified. OTP sent successfully',
      data:{
        otp:otp
      }  // Remove this in production
    });

  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin Login
export const adminLogin = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({ message: 'Mobile and OTP are required' });
    }     


    // Find user
    const user = await User.findOne({ mobile });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.role==="admin") {
      return res.status(403).json({ message: 'You are not authorized as admin' });
    }
    const result =  await verifyOtpService(mobile,otp)
    if(!result.success){
      res.status(400).json({
        success:false,
        message:"otp not verified..."
      })
    }
    const token = generateToken(user.userId);
    console.log("token generated:", token);
    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      data:user
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: error.message, error: error.message });
  }
};