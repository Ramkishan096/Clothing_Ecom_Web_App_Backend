import express from "express";
import { ShipmentServiceabilityAndCourierRate, ShiprocketShipmentCreation } from "../Services/ShipmentFunction.js";
const router = express.Router();



router.post("/S/shipmentcreate", async (req, res) => {
  console.log("Hit API Shipment creation...");
  // console.log("req body", req.body);
  const response = await ShiprocketShipmentCreation(req.body);
  // console.log("response from Shiprocket Shipment Creation", response);`
  return res.status(200).json(response);
});


router.get("/S/serviceAbilityAndCharges", async (req, res) => {
  console.log(" Hit ShiprocketServiceabilityAndCourierRate Test Route .....");
  console.log(" Query Parameters:", req.query);

  const response = await ShipmentServiceabilityAndCourierRate(
    req.query.pickup_pincode,
    req.query.destination_pincode,
    req.query.weight,
    req.query.payment_mode,
  );
  console.log("response from ShiprocketServiceabilityAndCourierRate", response);
  return res.status(200).json(response);
});



export default router;


// router.post("/S/retrunShipment", async (req, res) => {
//   console.log("Hit Generate AWB for RTO ...");
//   // console.log("req body", req.body);
//   const response = await ShiprocketShipmentForRetrun(req.body);
//   // console.log("response from Shiprocket Generate RTO", response);
//   return res.status(200).json(response);
// });

// http://localhost:5000/api/v1/T/Shiprocket/S/shipmentcreate