import orderService from "../services/orderService.js";
import generateOrderId from "../utils/generateOrderId.js";
import { createRazorpayOrder } from "../../RazorpaySystem/Services/razorpay/razorpay.service.js";


export const createPayment = async (req, res) => {
  try {

    console.log("hit api create Payment")
    console.log("req body:",req.body)
    const { amount, notes} = req.body;

    const result = await createRazorpayOrder({
      amount:amount,
      notes:notes,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }
    console.log("resonse send:",result)
    res.status(200).json({
      success: true,
      message:result.message,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data:null,
      error:error.message
    });
  }
};

// Create order after payment verification
export const createOrder = async (req, res) => {
  try {
    console.log("hit api create Order...")
    const { OrderDetails} = req.body;
    const userId = req.user.userId;
    const verifiedPayment = req.verifiedPayment;
    console.log("orderDetails:",OrderDetails)
    console.log("user:",userId)

    // Check if order already exists
    // const existingOrder = await orderService.getOrderByOrderId(OrderDetails.order_id);
    // if (existingOrder) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Order with this ID already exists",
    //   });
    // }

    // Prepare order data
    const orderData = {
      order_id:generateOrderId(),
      user_id:userId,
      guest_mobile_no:OrderDetails.shippingAddress.phone,
      shippingAddress: OrderDetails.shippingAddress,
      payment_method: OrderDetails.payment_type,
      items: OrderDetails.items || [],     
      shipping_charge: OrderDetails.shipping_charge || 0,
      cod_charge:OrderDetails.payment_type === "COD" ? OrderDetails.cod_charge || 0 : 0,      
      sub_total: OrderDetails.sub_total,
      total_discount: OrderDetails.total_discount || 0,     
      final_payable_amount: OrderDetails.final_payable_amount,
    };

    // If online payment, add payment reference
    if (OrderDetails.payment_type === "ONLINE" && verifiedPayment) {
      orderData.payment_reference = {
        txn_id: verifiedPayment.id,
        gateway: "Razorpay",
        payment_method: verifiedPayment.method,
        amount_paid: verifiedPayment.amount / 100,
        currency: verifiedPayment.currency || "INR",
        payment_date: new Date(verifiedPayment.created_at * 1000), // Convert timestamp
      };
      orderData.payment_status = "Paid";
    }

    // Create order in database
    console.log("Ready data for order Create:",orderData)
    const order = await orderService.createOrder(orderData);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: order,
      payment:
        OrderDetails.payment_type === "ONLINE"
          ? {
              verified: true,
              payment_id: verifiedPayment?.id,
              order_id: verifiedPayment?.order_id,
            }
          : null,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

export const getAllOrder = async (req, res) => {
  try {
    console.log("Hit API Get All Orders");

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filter = {
      order_status: req.query.order_status,
      payment_status: req.query.payment_status,
      payment_method: req.query.payment_method,
      order_id:req.query.order_id
    };

    const result = await orderService.getAllOrders(
      page,
      limit,
      filter
    );

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Get All Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch orders",
    });
  }
};



export const getBuyerOrders = async (req, res) => {
  try {
    console.log("Hit API Get Buyer Orders");
    const userId = req.user.userId; // Assuming userId is available in req.user

    const result = await orderService.getBuyerOrders(userId);

    return res.status(200).json({
      success: true,
      message: "Buyer orders fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Get Buyer Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch buyer orders",
      data: null,
      error: error.message
    });
  }
};

// Get order details
export const getOrder = async (req, res) => {
  try {
    console.log("hit get Order by order_id")
    const { order_id } = req.params;
    const order = await orderService.getOrderByOrderId(order_id);

    res.status(200).json({
      success: true,
      message:"order fetch Successfully...",
      data:order,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { status, message } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const order = await orderService.updateOrderStatus(
      order_id,
      status,
      message,
    );

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { reason } = req.body;

    const order = await orderService.cancelOrder(order_id, reason);

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
