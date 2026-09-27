import { ShiprocketShipmentCreation } from "../../Shipment/Services/ShipmentFunction.js";
import Order from "../model/orderModel.js";
import OrderModel from "../model/orderModel.js";
import generateOrderId from "../utils/generateOrderId.js";

class OrderService {
  // Create new order
  async createOrder(orderData) {
    try {
      console.log("hit method createOrder...");
      const order = new OrderModel({
        ...orderData,
      });

      // Add initial tracking entry
      order.tracking.push({
        status: "Placed",
        message: "Order placed successfully",
        source: "System",
      });
      console.log("order_________", order);
      const response = await ShiprocketShipmentCreation(order);
      if (!response.success) {
        throw new Error(
          `Error in Shiprocket order creating :${response?.error || response.message}`,
        );
      }
      console.log("response from shiprokcet:", response);
      order.shiprocket = {
        order_id: response.data.order_id,
        channel_order_id:response.data.channel_order_id,
        shipment_id: response.data.shipment_id,
      };
      await order.save();
      return order;
    } catch (error) {
      throw new Error(`Error creating order: ${error.message}`);
    }
  }

  // Get order by ID
  async getOrderByOrderId(orderId) {
    try {
      console.log("hit getOrder Buy order_id ", orderId);
      const order = await OrderModel.findOne({ order_id: orderId });
      if (!order) {
        throw new Error("Order not found");
      }
      return order;
    } catch (error) {
      throw new Error(`Error fetching order: ${error.message}`);
    }
  }

  // Get orders by user email
  async getOrdersByEmail(email) {
    try {
      const orders = await Order.find({ "shippingAddress.email": email }).sort({
        createdAt: -1,
      });
      return orders;
    } catch (error) {
      throw new Error(`Error fetching orders: ${error.message}`);
    }
  }

  async getBuyerOrders(userId) {
    console.log("....//// get buyer order........");
    try {
      const orders = await Order.find({ user_id: userId }).sort({
        createdAt: -1,
      });
      return orders;
    } catch (error) {
      throw new Error("Error fetching Orders:", error.message);
    }
  }
  // Update order status
  async updateOrderStatus(orderId, status, message = "") {
    try {
      const order = await Order.findOne({ order_id: orderId });
      if (!order) {
        throw new Error("Order not found");
      }

      // Validate status transition
      const validStatuses = [
        "Placed",
        "Confirmed",
        "Packed",
        "Ready For Pick Up",
        "Out For Delivery",
        "Delivered",
        "Cancelled",
        "Completed",
      ];

      if (!validStatuses.includes(status)) {
        throw new Error("Invalid status");
      }

      // Prevent status regression
      const statusOrder = validStatuses;
      const currentIndex = statusOrder.indexOf(order.order_status);
      const newIndex = statusOrder.indexOf(status);

      if (currentIndex > newIndex && status !== "Cancelled") {
        throw new Error("Cannot revert to previous status");
      }

      order.order_status = status;

      // Add tracking entry
      order.tracking.push({
        status: status,
        message: message || `Order ${status.toLowerCase()}`,
        source: "System",
      });

      // If delivered, update payment status for COD
      if (status === "Delivered" && order.payment_method === "COD") {
        order.payment_status = "Paid";
      }

      await order.save();
      return order;
    } catch (error) {
      throw new Error(`Error updating order status: ${error.message}`);
    }
  }

  // Update payment status
  async updatePaymentStatus(orderId, paymentStatus, paymentReference = {}) {
    try {
      const order = await Order.findOne({ order_id: orderId });
      if (!order) {
        throw new Error("Order not found");
      }

      const validStatuses = ["Pending", "Paid", "Failed", "Refunded"];
      if (!validStatuses.includes(paymentStatus)) {
        throw new Error("Invalid payment status");
      }

      order.payment_status = paymentStatus;

      if (paymentReference && Object.keys(paymentReference).length > 0) {
        order.payment_reference = {
          ...order.payment_reference,
          ...paymentReference,
          payment_date: new Date(),
        };
      }

      await order.save();
      return order;
    } catch (error) {
      throw new Error(`Error updating payment status: ${error.message}`);
    }
  }

  // Update Shiprocket details
  async updateShiprocketDetails(orderId, shiprocketData) {
    try {
      const order = await Order.findOne({ order_id: orderId });
      if (!order) {
        throw new Error("Order not found");
      }

      order.shiprocket = {
        ...order.shiprocket,
        ...shiprocketData,
      };

      await order.save();
      return order;
    } catch (error) {
      throw new Error(`Error updating shiprocket details: ${error.message}`);
    }
  }

  // Cancel order
  async cancelOrder(orderId, reason = "Customer requested cancellation") {
    try {
      const order = await Order.findOne({ order_id: orderId });
      if (!order) {
        throw new Error("Order not found");
      }

      // Check if order can be cancelled
      const cancellableStatuses = ["Placed", "Confirmed", "Packed"];
      if (!cancellableStatuses.includes(order.order_status)) {
        throw new Error("Order cannot be cancelled at this stage");
      }

      order.order_status = "Cancelled";
      order.tracking.push({
        status: "Cancelled",
        message: reason,
        source: "System",
      });

      // If payment was made, mark for refund
      if (order.payment_status === "Paid") {
        order.payment_status = "Refunded";
      }

      await order.save();
      return order;
    } catch (error) {
      throw new Error(`Error cancelling order: ${error.message}`);
    }
  }

  // Get all orders with pagination
  async getAllOrders(page = 1, limit = 10, filter = {}) {
    try {
      const skip = (page - 1) * limit;

      const query = {};
      if (filter.order_status) {
        query.order_status = filter.order_status;
      }
      if (filter.payment_status) {
        query.payment_status = filter.payment_status;
      }
      if (filter.payment_method) {
        query.payment_method = filter.payment_method;
      }
      if(filter.order_id){
        query.order_id = filter.order_id
      }


      const orders = await OrderModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await OrderModel.countDocuments(query);

      console.log("total order:",total)

      return {
        orders,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new Error(`Error fetching orders: ${error.message}`);
    }
  }

  // Get order statistics
  async getOrderStats() {
    try {
      const stats = await Order.aggregate([
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$final_payable_amount" },
            pendingOrders: {
              $sum: { $cond: [{ $eq: ["$order_status", "Placed"] }, 1, 0] },
            },
            deliveredOrders: {
              $sum: { $cond: [{ $eq: ["$order_status", "Delivered"] }, 1, 0] },
            },
            cancelledOrders: {
              $sum: { $cond: [{ $eq: ["$order_status", "Cancelled"] }, 1, 0] },
            },
            codOrders: {
              $sum: { $cond: [{ $eq: ["$payment_method", "COD"] }, 1, 0] },
            },
            onlineOrders: {
              $sum: { $cond: [{ $eq: ["$payment_method", "ONLINE"] }, 1, 0] },
            },
          },
        },
      ]);

      return (
        stats[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          deliveredOrders: 0,
          cancelledOrders: 0,
          codOrders: 0,
          onlineOrders: 0,
        }
      );
    } catch (error) {
      throw new Error(`Error getting order stats: ${error.message}`);
    }
  }
}

export default new OrderService();
