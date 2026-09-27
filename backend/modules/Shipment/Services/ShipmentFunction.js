import axios from "axios";
import { createShiprocketOrder, getAvailableCouriers, selectBestCourier} from "./Shiprocket/shiproket.function.js";
import { buildShiprocketPayload } from "./Adaptar/payload.js";
import { mapServiceabilityAndCourierRate } from "./Adaptar/mapServiceabilityData.js";

export const ShiprocketShipmentCreation = async (data) => {
  console.log(" Hit Function Shipment Creation  .....");
  try {    
    console.log("🚀 Creating new shipment in Shiprocket...");
    const shiprocketPayload = buildShiprocketPayload(data);
    console.log("Payload for Shiprocket:", shiprocketPayload);

    const shiprocketResp = await createShiprocketOrder(shiprocketPayload);
    console.log("Shiprocket Response:", shiprocketResp);

    if (!shiprocketResp.success || !shiprocketResp.data?.shipment_id) {
      return {
        success: false,
        data: null,
        message: "Shiprocket shipment creation failed",
        error: shiprocketResp.error || "Unknown error",
      };
    }

    return {
      success: true,
      data: shiprocketResp.data,
      message: "Shipment creation successful",
    };
  } catch (error) {
    console.error(" Shipment Creation Error:", error.message);
    return {
      success: false,
      data: null,
      message: error.message || "Shipment creation failed",
      error: error.details || "No additional error details",
    };
  }
};




export const ShipmentServiceabilityAndCourierRate = async (
  pickup_pincode,
  destination_pincode,
  weight,
  payment_mode,
) => {
  console.log(" Hit check Service ability and courier Rate .....");

  try {   

    if (!pickup_pincode || !destination_pincode) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Pickup and Delivery pincode required",
      });
    }

    const couriers = await getAvailableCouriers({
      pickup_pincode: Number(pickup_pincode),
      destination_pincode: Number(destination_pincode),
      weight,
      payment_mode,
    });

    if (!couriers.data.length) {
      return {
        success: false,
        data: null,
        message: " No courier service available for this pincode...",
      };
    }

    const bestCourier = selectBestCourier(couriers.data);
    const mapData = mapServiceabilityAndCourierRate(bestCourier.data);
    console.log("✅ Mapped Data for Sysytem :", mapData);
    return {
      success: true,
      data: mapData,
      message: bestCourier.message,
    };
  } catch (error) {
    console.error("❌ Serviceability Error:", error.message);

    return {
      success: false,
      data: null,
      message: error.message || "Serviceability failed",
      error: error.message,
    };
  }
};






// const ShiprocketStatustracking = async (awb_code) => {
//   console.log("Hit Shiprocket AWB tracking...");
//   try {
//     // Implement AWB tracking logic here
//     console.log("Tracking AWB code:", awb_code);

//     const response = await getShiprocketTrackingByAwb(awb_code);
//     console.log("Tracking Response:", response);
//     if (!response.success) {
//       return {
//         success: false,
//         data: null,
//         message: response.message || "Failed to track AWB",
//       };
//     }
//     return {
//       success: true,
//       data: {
//         current_status:
//           response.data.tracking_data.shipment_track[0].current_status,
//         history: response.data.tracking_data.shipment_track_activities,
//       },

//       message: "AWB tracking successful",
//     };
//   } catch (error) {
//     console.error("AWB Tracking Error:", error.message);
//     return {
//       success: false,
//       data: null,
//       message: error.message || "AWB tracking failed",
//     };
//   }
// };













// const ShiprocketShipmentForRetrun = async (shipmentId) => {
//   console.log("Hit Shiprocket Return Genrate .....");
//   console.log("shipmentId:", shipmentId);
  
//   try {
//     // -----------------------------------
//     // CASE 2 → AWB  generated for Return
//     // -----------------------------------

//     console.log("🚚 Generating / Retrying AWB for Return...");

//     const responseRuturn = await assignCourierAndGenerateAWB({
//       shipment_id: shipmentId,
//       is_return: true,
//     });

//     console.log("AWB Assignment Response for Return:", responseRuturn);

//     if (!responseRuturn.success) {
//       return {
//         success: false,
//         data: responseRuturn.error || null,
//         message: "AWB generation failed",
//         error: responseRuturn.error || "Unknown error",
//       };
//     }
//     // console.log("response Return :",responseRuturn)
//     const awbCodeForReturn = responseRuturn.data.awbResp.data;
//     console.log("🚀 Return Shipment Created with AWB:", awbCodeForReturn);
//     console.log("corieer name:", responseRuturn.data.courier.courier_name);

//     return {
//       success: true,
//       message: "Return Shipment for AWB generated successfully",
//       data: {
//         awb_code_return: awbCodeForReturn.awb_code || null,
//         courier_name_in_return:
//           responseRuturn.data.courier.courier_name || null,
//         courier_id_in_return: responseRuturn.data.courier.courier_id || null,
//         return_charges: responseRuturn.data.courier?.freight_charge || null,

//         rawResponse: responseRuturn.data.awbResp || null,
//       },
//     };
//   } catch (error) {
//     console.error("Return Generation Error:", error.message);
//     return {
//       success: false,
//       data: null,
//       message: error.message || "Return generation failed",
//     };
//   }
// };
