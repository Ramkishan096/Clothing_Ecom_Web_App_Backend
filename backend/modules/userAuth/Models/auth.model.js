import mongoose from "mongoose";
import validator from "validator";

const { Schema } = mongoose;

// Sub-schema for Addresses
const addressSchema = new Schema({
  street: String,
  city: String,
  state: String,
  pin_code: Number,
  isDefault: { type: Boolean, default: false },
});

//Role enum for better type safety
const userRoles = {
  BUYER: "buyer",
  ADMIN: "admin",
  SUPER_ADMIN: "superAdmin",
};

const userSchema = new Schema(
  {
    userId: { type: String, unique: true }, // Custom ID: Mobile + Unix
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    mobile: { type: Number, unique: true, sparse: true, required: true },
    password: { type: String, required: true, select: false }, // select: false to exclude from queries by default

    role: {
      type: String,
      enum: Object.values(userRoles),
      default: userRoles.BUYER, // Default role is buyer
    },
    // Arrays for nested data
    addresses: [addressSchema],
    isVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    statusReason:{
      type:String
    }
  },
  { timestamps: true },
); // This adds createdAt and updatedAt automatically

userSchema.pre("save", function () {
  if (!this.userId) {
    const time = Date.now();
    const random = Math.floor(1000 + Math.random() * 9000);
    this.userId = `USR-${time}-${random}`;
  }
});

const User = mongoose.model("User", userSchema);
export { User, userRoles };
export default User;
