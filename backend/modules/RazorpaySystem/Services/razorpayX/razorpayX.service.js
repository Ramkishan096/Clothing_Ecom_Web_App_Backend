import Razorpay from "razorpay";
import axios from "axios";

// ================= CONFIG =================
export const razorpayX = new Razorpay({
  key_id: process.env.RAZORPAY_PAYOUT_KEY,
  key_secret: process.env.RAZORPAY_PAYOUT_SECRET,
});

const BASE_URL = "https://api.razorpay.com/v1";

const AUTH = Buffer.from(
  `${razorpayX.key_id}:${razorpayX.key_secret}`,
).toString("base64");


// =======================================================
// 1. CREATE CONTACT
// =======================================================
export const createContact = async ({
  name,
  email,
  phone,
  reference_id,
  type = "customer",
}) => {
  try {
    console.log("Hit function create Contact ...");
    const payload = {
      name,
      email,
      contact: phone,
      type,
      reference_id,
      notes: {
        purpose: "Payout Account",
      },
    };

    const response = await axios.post(`${BASE_URL}/contacts`, payload, {
      headers: {
        Authorization: `Basic ${AUTH}`,
        "Content-Type": "application/json",
      },
    });

    return {
      success: true,
      message:"Create Contatc Id Successfully...",
      contact_id: response.data.id,
      data: response.data,
    };
  } catch (error) {
    console.log("error:",error.message || error?.response?.data)
     return{
      success:false,
      message:"failed create Conatct id Successfully...:",
      data:null,
      error:error?.response?.data?.error || error?.message
    }
  }
};

// =======================================================
// 2. CREATE BANK FUND ACCOUNT
// =======================================================
export const createFundAccount = async (
  contact_id,
  account_holder_name,
  ifsc,
  account_number,
) => {
  try {
    console.log("hit fucntion create Fund Account ...");
    const payload = {
      contact_id,
      account_type: "bank_account",
      bank_account: {
        name: account_holder_name,
        ifsc,
        account_number,
      },
    };

    const response = await axios.post(
      `${BASE_URL}/fund_accounts`,
      payload,

      {
        headers: {
          Authorization: `Basic ${AUTH}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("response:", response.data);

    return {
      success: true,
      message:"Create Fund Account successfully...",
      fund_account_id: response.data.id,
      data: response.data,
    };
  } catch (error) {
    console.log("error:",error.message || error?.response?.data)
     return{
      success:false,
      message:"failed create Fund Account...:",
      data:null,
      error:error?.response?.data?.error || error?.message
    }
  }
};

// =======================================================
// 3. CREATE UPI FUND ACCOUNT
// =======================================================
export const createUPIFundAccount = async (contact_id, vpa) => {
  console.log("hit function create upi fund Account...");
  try {
    const payload = {
      contact_id,
      account_type: "vpa",
      vpa: {
        address: vpa,
      },
    };
    const response = await axios.post(
      `${BASE_URL}/fund_accounts`,
      payload,

      {
        headers: {
          Authorization: `Basic ${AUTH}`,
          "Content-Type": "application/json",
        },
      },
    );
    console.log("response:", response.data);
    return {
      success: true,
      message:"Create UPI Fund Account Successfully...",
      fund_account_id: response.data.id,
      data: response.data,
    };
  } catch (error) {
    console.log("error:",error.message || error?.response?.data)
     return{
      success:false,
      message:"failed upi  account...:",
      data:null,
      error:error?.response?.data?.error || error?.message
    }
  }
};

// =======================================================
// 4. CREATE PAYOUT Buyer and seller 
// =======================================================
export const createPayout = async ({
  fund_account_id,
  amount,
  mode = "IMPS",
  purpose,
  reference_id = null,
  notes = {},
}) => {
  try {
    console.log("hit function create payout....");
    console.log(
      "fund_account_id:",
      fund_account_id,
      "amount:",
      amount,
      "mode:",
      mode,
      "purpose:",
      purpose,
    );

    const payoutAmount = Math.round(amount * 100);
    const idempotencyKey = `mp_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const payoutPayload = {
      account_number: process.env.RAZORPAYX_ACCOUNT_NUMBER,
      fund_account_id: fund_account_id,
      amount: payoutAmount, // paise
      currency: "INR",
      mode: mode, // NEFT / IMPS / RTGS
      purpose: purpose, // refund / buyerPayout for case cod /sellerpayout",
      queue_if_low_balance: false,
            // optional fields
      ...(reference_id && { reference_id }),
      ...(Object.keys(notes).length > 0 && { notes }),

    };

    const response = await axios.post(
      "https://api.razorpay.com/v1/payouts",
      payoutPayload,
      {
        auth: {
          username: razorpayX.key_id, //.process.env.RAZORPAY_PAYOUT_KEY, // key_id
          password: razorpayX.key_secret //process.env.RAZORPAY_PAYOUT_SECRET, // key_secret
        },
        headers: {
          "Content-Type": "application/json",
          "X-Payout-Idempotency": idempotencyKey,
        },
      },
    );

    console.log("payout response:", response.data);

    return {
      success: true,
      message:response.message || "payout successfully....",
      payout_id: response.data.id,
      data: response.data,
    };
  } catch (error) {
    console.error("CREATE_PAYOUT_ERROR:", error.response.data || error.message);
    return{
      success:false,
      message:"failed payout:",
      data:null,
      error:error?.response?.data?.error || error?.message
    }
  }
};