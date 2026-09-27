import express from "express";
import { ShipmentServiceabilityAndCourierRate } from "../Services/ShipmentFunction.js";
const router = express.Router();

router.post("/shipping-charge", async (req, res) => {
  try {
    console.log(" Hit shiping charge api....");
    console.log("req.body:", req.body);
    const { totalWeight, pincode, paymentType } = req.body;
    let shipping_charge = null;
    const response = await ShipmentServiceabilityAndCourierRate(
      471001,
      pincode,
      totalWeight,
      paymentType,
    );
    console.log(
      "response from ShiprocketServiceabilityAndCourierRate",
      response,
    );
    shipping_charge = response.data.shipingCharge;
    return res.status(200).json({
      success: true,
      data: { shipping_charge: shipping_charge },
      message: "get Shipping charge succefully...",
    });
  } catch (error) {
    console.log("error:", error.message);
    return res.status(500).json({
      success: false,
      message: `get shipping charge failed:${error.message}`,
      data: null,
      error: error.message,
    });
  }
});

router.post("/cod-charge", async (req, res) => {
  try {
    console.log(" Hit shipping cod-charge...");
    console.log("req.body:", req.body);
    const { totalWeight, pincode, paymentType } = req.body;
    let cod_charge = null;
    const response = await ShipmentServiceabilityAndCourierRate(
      471001,
      pincode,
      totalWeight,
      paymentType,
    );
    console.log(
      "response from ShiprocketServiceabilityAndCourierRate",
      response,
    );
    cod_charge = response.data.codCharges;
    return res.status(200).json({
      success: true,
      data: { cod_charge: cod_charge },
      message: "get cod charge succefully...",
    });
  } catch (error) {
    console.log("error:", error.message);
    return res.status(500).json({
      success: false,
      message: `get cod charge failed:${error.message}`,
      data: null,
      error: error.message,
    });
  }
});

router.post("/serviceability", async (req, res) => {
  try {
    console.log(" Hit serviceability...");
    console.log("req.body:", req.body);
    const { totalWeight, pincode, paymentType } = req.body;
    const response = await ShipmentServiceabilityAndCourierRate(
      471001,
      pincode,
      totalWeight,
      paymentType,
    );
    if(!response.success){
       throw new Error("Not availbe couier this pincode...")
    }
    return res.status(200).json({
      success: true,
      data: response.data,
      message: "get service ability succefully..." ,
    });
  } catch (error) {
    console.log("error:", error.message);
    return res.status(500).json({
      success: false,
      message: `get service ability failed:${error.message}`,
      data: null,
      error: error.message,
    });
  }
});

export default router;

// http://localhost:5000/api/v1/Shiprocket//S/shipmentcreate
