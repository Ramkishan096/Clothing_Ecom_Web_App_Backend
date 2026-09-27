import mongoose from "mongoose";

// ─────────────────────────────────────────────
// Order Item Schema
// ─────────────────────────────────────────────

const orderItemSchema = new mongoose.Schema(
  {
    product_id: {
      type: String,
      required: true,
    },

    product_name: {
      type: String,
      required: true,
    },

    cover_image: {
      type: String,
      required: true,
    },

    mrp_price: {
      type: Number,
      required: true,
    },

    discount_rate: {
      type: Number,
      required: true,
      default: 0,
    },

    selling_price: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    size: {
      type: String,
      default: "",
    },
  },
  { _id: false },
);

// ─────────────────────────────────────────────
// Tracking Schema
// ─────────────────────────────────────────────

const trackingSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        "Placed",
        "Confirmed",
        "Packed",
        "Ready For Pick Up",
        "Out For Delivery",
        "Delivered",
        "Cancelled",
        "Completed",
      ],
      required: true,
    },

    time: {
      type: Date,
      default: Date.now,
    },

    message: {
      type: String,
      default: "",
    },

    source: {
      type: String,
      default: "",
    },
  },
  { _id: false },
);

// ─────────────────────────────────────────────
// Main Order Schema
// ─────────────────────────────────────────────

const orderSchema = new mongoose.Schema(
  {
    order_id: {
      type: String,
      unique: true,
      required: true,
    },
    user_id:{
      type:String,
      required:true
    },
    guest_mobile_no: {
      type: String,
      default: "",
      match: /^[6-9]\d{9}$/,
    },

    // Customer Address
    shippingAddress: {
      first_name: {
        type: String,
        required: true,
      },

      last_name: {
        type: String,
        required: true,
      },

      phone: {
        type: String,
        required: true,
        match: /^[6-9]\d{9}$/, // Indian 10 digit mobile
      },

      email: {
        type: String,
        required: true,
        lowercase: true,
      },

      address: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        required: true,
      },

      state: {
        type: String,
        required: true,
      },

      pincode: {
        type: String,
        required: true,
      },
    },

    // Payment
    payment_method: {
      type: String,
      enum: ["COD", "ONLINE"],
      default: "COD",
    },

    payment_status: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },

    payment_reference: {
      txn_id: { type: String, default: "" },

      gateway: { type: String, default: "" },

      payment_method: { type: String, default: "" },

      payment_date: { type: Date, default: null },

      amount_paid: { type: Number, default: 0 },

      currency: { type: String, default: "INR" },
    },

    shipping_charge: {
      type: Number,
      default: 0,
    },

    cod_charge: {
      type: Number,
      default: 0,
    },

    // Price Details
    sub_total: {
      type: Number,
      required: true,
    },

    total_discount: {
      type: Number,
      default: 0,
    },

    final_payable_amount: {
      type: Number,
      required: true,
    },

    // Order Status
    order_status: {
      type: String,
      enum: [
        "Placed",
        "Confirmed",
        "Packed",
        "Ready For Pick Up",
        "Out For Delivery",
        "Delivered",
        "Cancelled",
        "Completed",
      ],
      default: "Placed",
    },

    items: [orderItemSchema],

    // Shiprocket
    shiprocket: {
      order_id: {
        type: String,
        default: "",
      },
      channel_order_id:{
        type:String,
        default:""
      },

      shipment_id: {
        type: String,
        default: "",
      },

      awb_code: {
        type: String,
        default: "",
      },

      courier_name: {
        type: String,
        default: "",
      },
    },

    tracking: [trackingSchema],
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
