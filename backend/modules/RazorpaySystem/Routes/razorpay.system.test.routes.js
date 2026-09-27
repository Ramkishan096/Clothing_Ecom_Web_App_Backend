import express from "express";
import { refundToOriginalSource } from "../Services/razorpay/refund.service.js";
import { verifyBankAccount } from "../Services/razorpay/verifyBankAccount.service.js";
import { verifyUpiId } from "../Services/razorpay/verifyUpi.service.js";
import { createPayout } from "../Services/razorpayX/razorpayX.service.js";
import { createRazorpayOrder } from "../Services/razorpay/razorpay.service.js";



const router = express.Router();

router.post("/T/create-payment",async(req,res)=>{
   console.log("Hit api create payment order in rarzopay...");
   console.log("req.body",req.body);
   const response = await createRazorpayOrder(req.body)
   console.log("create payment order Response:", response);
   return res.status(200).json(response);
})

router.post("/T/refund", async (req, res) => {
  console.log(" Hit Refund Test Route .....");
  console.log(" Query Parameters:", req.query);
  console.log("Refund Request Body:", req.body);

  const response = await refundToOriginalSource({
    paymentId: req.query.paymentId,
    amount: req.body.amount,
    speed: req.body.speed, // optional: "optimum"? "fast", :"slow"
    reciept: req.body.reciept,
    notes: req.body.notes,
  });
  console.log("Refund Response:", response);
  return res.status(200).json(response);
});

router.post("/T/fundAccount", async (req, res) => {
  console.log("Hit funct_account...");
  const response = await verifyBankAccount(
    req.query.account_number,
    req.query.ifsc,
    req.query.name,
  );
  console.log("Fund account :", response);
  return res.status(200).json(response);
});

router.post("/T/upiId", async (req, res) => {
  console.log("Hit funct_account...");
  const response = await verifyUpiId(req.query.upiId);
  console.log("Fund account :", response);
  return res.status(200).json(response);
});


router.post("/T/createPayout", async (req, res) => {
  console.log("Hit create payout route...");
  const response = await createPayout(req.body);
  console.log("Create payout response:", response);
  return res.status(200).json(response);
})

// router.post("/webhooks/razorpay",razorpayWebhookRecieve)

export default router;

// API Endpoints to test in postman

