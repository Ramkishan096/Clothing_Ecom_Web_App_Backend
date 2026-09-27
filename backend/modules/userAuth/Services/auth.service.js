import User from "../Models/auth.model.js";
import OTP from "../Models/otp.model.js";
import { generateOtp } from "../userAuthUtils/otp.util.js";
import { hashPassword } from "../userAuthUtils/password.util.js";
import { generateToken } from "../userAuthUtils/token.util.js";

//=======Sent otp  service ========================================================================

// STEP 1: Send OTP
export const sendOtpService = async (identifier) => {
  const otp = generateOtp();

  await OTP.deleteMany({ identifier });

  await OTP.create({
    identifier,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
  });

  console.log("OTP Send:", otp); // SMS/Email integration here
  return otp
  // return { success: true, message: "OTP sent successfully", data: otp };
};

// STEP 2: Verify OTP
export const verifyOtpService = async (identifier, otp) => {
  console.log("Verifying OTP for:", identifier, "OTP:", otp);

  const cleanIdentifier = String(identifier).trim().toLowerCase();
  const cleanOtp = String(otp).trim();

  console.log("Cleaned Identifier:", cleanIdentifier, "Cleaned OTP:", cleanOtp);

  const record = await OTP.findOne({
    identifier: cleanIdentifier,
    otp: cleanOtp,
  });

  if (!record) throw new Error("Invalid OTP");

  if (record.expiresAt < new Date()) throw new Error("OTP expired");
  console.log(".............");

  await OTP.deleteMany({ identifier: cleanIdentifier });
  console.log("OTP verified and deleted for:", cleanIdentifier);
  return {
    success: true,
    message: "OTP verified successfully",
    verified: true,
  };
};

export const resendOtpService = async (identifier) => {  
  const otp = generateOtp();
  await OTP.deleteMany({ identifier });
  await OTP.create({
    identifier,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
  });
  console.log("OTP Resend:", otp); // SMS/Email integration here
  return otp;
  // return { success: true, message: "OTP Resent successfully", data: otp };
};

// STEP 3: Register User
export const registerUserService = async (data) => {
  console.log("Register User Service Called with data:", data);
  const { mobile, firstName, lastName, password } = data;
  if (!mobile) {
    throw new Error("Mobile number is required");
  }

  const userExists = await User.findOne({ mobile: mobile });
  console.log("User exists check for mobile:", mobile, "Result:", userExists);

  if (userExists) {
    throw new Error("User already exists");
  }

  const hashedPassword = await hashPassword(password);
  // console.log("Hashed Password:", hashedPassword);
  const user = await User.create({
    mobile: mobile,
    firstName: firstName,
    lastName: lastName,    
    password: hashedPassword,
    isVerified: true,
  });
  // console.log("User created in DB:", user);

  const token = generateToken(user.userId);

  return {
    success: true,
    message: "User registered successfully",
    data: { user, token },
  };
};

export const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:process.env.NODE_ENV==="production" ? "none" : "lax",
    maxAge: 30 * 60 * 1000,
  });
};

export const addAddressService = async (userId, email,address) => {
  console.log("Adding address for userId:", userId, "Address:", address);
  const user = await User.findOne({ userId });

  if (!user) {
    throw new Error("User not found");
  }

  if (address.isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }
  user.email = email; // Update the user's email with the provided value

  user.addresses.push({
    street: address.street,
    city: address.city,
    state: address.state,
    pin_code: address.pin_code,
    isDefault: address.isDefault || false,
  });

  await user.save();

  return user.addresses;
};

export const updateAddressService = async (userId, addressId, updatedAddress,email) => {
  console.log("Updating address for userId:", userId, "AddressId:", addressId, "Updated Address:", updatedAddress,"email:",email);
  const user = await User.findOne({ userId });

  if (!user) {
    throw new Error("User not found");
  } 
  // if (updatedAddress.isDefault) {
  //   user.addresses.forEach((addr) => {
  //     addr.isDefault = false;
  //   });
  // }
  user.email = email; 
  user.addresses = user.addresses.map((addr) => {
    console.log("address map :",addr)
      return {
        street: updatedAddress.street,
        city: updatedAddress.city,
        state: updatedAddress.state,
        pin_code: updatedAddress.pin_code,
        isDefault: updatedAddress.isDefault || false,
      };
  });
  console.log("Updated addresses for userId:", userId, "Addresses:", user.addresses);

  await user.save();

  return user.addresses;
};

export const updateProfileService = async(userId,firstName,lastName,email)=>{
  
  const user = await User.findOne({ userId });
   if (!user) {
    throw new Error("User not found");
  } 
  user.email = email; 
  user.firstName =firstName;
  user.lastName = lastName;
  user.email = email;
  await user.save();
  return user   
}