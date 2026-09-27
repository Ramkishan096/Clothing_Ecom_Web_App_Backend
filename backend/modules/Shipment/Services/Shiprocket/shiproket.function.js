import axios from "axios";
import { getShiprocketToken } from "./auth.shiprocket.js";

export const createShiprocketOrder = async (payload) => {
  console.log("hit api call acutal shipment ShiprocketOrder...");
  try {
    const token = await getShiprocketToken();

    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      },
    );
    console.log(
      "--------------------------------------------------------------------------------",
    );
    console.log("resonse: creating shipment:", response.data);
    console.log("resonse: creating shipment id :", response.data.shipment_id);
    console.log(
      "--------------------------------------------------------------------------------",
    );

    return {
      success: true,
      data: response.data,
      message: "Shipment created successfully",
    };
  } catch (error) {
    console.error(
      "❌ Shiprocket Create Order Error:",
      error.response?.data || error.message,
    );

    return {
      success: false,
      data: null,
      message:
        "Failed to create shipment, error: " +
        (error.response?.data || error.message),
      error: error.response?.data?.errors || "unknown error",
    };
  }
};

export const getShiprocketTrackingByAwb = async (awb) => {
  console.log("hit get Shiprocket Tracking By AWB.....");
  try {
    const token = await getShiprocketToken();

    const resp = await axios.get(
      `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awb}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return {
      success: true,
      data: resp.data,
      message: "Tracking data fetched successfully",
    };
  } catch (error) {
    console.error("Shiprocket tracking error:", error.response?.data);
    return {
      success: false,
      data: null,
      message: "Failed to fetch tracking data",
      error: error.message,
    };
  }
};

export const getShipmentDetials = async (shipmentId) => {
  try {
    console.log("hit get shipment detials...");
    const token = await getShiprocketToken();

    if (!token) {
      // console.log("token not genrated : ", token);
      return { success: false, message: "token not genrated", data: null };
    }

    if (!shipmentId) {
      return { success: false, message: "shipmentId is required", data: null };
    }
    const resp = await axios.get(
      `https://apiv2.shiprocket.in/v1/external/shipments/${shipmentId}`,

      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      },
    );
    return {
      success: true,
      message: "Get details shipment",
      data: resp.data,
    };
  } catch (error) {
    console.log("failed to handel get shipment ....", error.message);
    return {
      success: false,
      message: `Get Shipment Details API error: ${error.message}`,
      data: null,
      error: error.response?.data || "Unknown error",
    };
  }
};

export const getAvailableCouriers = async ({
  pickup_pincode,
  destination_pincode,
  weight,
  payment_mode,
}) => {
  console.log("hit functions get AvailableCourrieers...:");
  try {
    const token = await getShiprocketToken();
    console.log("shiproket token :",token)
    console.log(
      "weigth :",
      weight,
      "payment_mode:",
      payment_mode,
      "pickup_pincode :",
      pickup_pincode,
      "destination_pincode :",
      destination_pincode,
    );
    const isCod = payment_mode?.toLowerCase() === "cod" ? 1 : 0;
    console.log("is Cod :", isCod);
    const resp = await axios.get(
      "https://apiv2.shiprocket.in/v1/external/courier/serviceability/",
      {
        params: {
          pickup_postcode: Number(pickup_pincode),
          delivery_postcode: Number(destination_pincode),
          weight: weight,
          cod: isCod, // 1 or 0  1 means will be is cod and 0 means well be prepaid
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 15000,
      },
    );

    const couriers = resp.data?.data?.available_courier_companies || [];

    if (!couriers.length) {
      console.warn("⚠️ No couriers available", {
        pickup_pincode,
        destination_pincode,
        weight,
        payment_mode,
      });
    }

    const dataforprint = couriers.map((item) => {
      return {
        courier_name: item.courier_name,
        days: item.estimated_delivery_days,
        charges: item.freight_charge,
      };
    });
    console.log("dataforprint:", dataforprint);

    return {
      success: true,
      data: couriers,
      message: "Couriers fetched successfully",
    };
  } catch (error) {
    console.error("❌ Shiprocket Serviceability Error:", {
      message: error.message,
      response: error.response?.data,
    });

    return {
      success: false,
      data: [],
      message: "Failed to fetch couriers",
      error: error.response?.data || error.message,
    };
  }
};


export const selectBestCourier = (couriers = []) => {
  try {
    console.log("hit function selectBestCourier...");
    console.log("no of couriers:", couriers.length);

    if (!Array.isArray(couriers) || couriers.length === 0) {
      return { success: false, data: null, message: "No couriers available" };
    }

    // AIR couriers remove
    const filteredCouriers = couriers.filter((c) => {
      const name = c.courier_name?.toLowerCase() || "";

      return !name.includes("air");
    });

    console.log(
      "filteredCouriers:",
      filteredCouriers.map((c) => c.courier_name),
    );

    const PRIORITY = [
      "Delhivery Surface",
      "Shadowfax",
      "Blue Dart",
      "India Post-Speed Post",
      "Xpressbees",
    ];

    for (const preferred of PRIORITY) {
      const found = filteredCouriers.find((c) =>
        c.courier_name.toLowerCase().includes(preferred.toLowerCase()),
      );

      if (found) {
        return {
          success: true,
          data: found,
          message: `Selected preferred courier: ${found.courier_name}`,
        };
      }
    }

    return {
      success: true,
      data: filteredCouriers[0] || couriers[0],
      message: "No preferred courier found, selected first available",
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: "Error occurred while selecting best courier",
    };
  }
};