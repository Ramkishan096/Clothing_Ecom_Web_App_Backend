// dashboard.controller.js
import User from "../../userAuth/Models/auth.model.js";
import Order from "../../OrderModule/model/orderModel.js";
import Product from "../../ProductModule/product.model.js";

// ============= DASHBOARD STATS CONTROLLERS =============

export const getDashboardStats = async (req, res) => {
  try {
    // Get all stats in parallel for better performance
    const [
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue,
      recentOrders,
      recentUsers,
      pendingOrders,
    ] = await Promise.all([
      // Total users
      User.countDocuments(),
      
      // Total orders
      Order.countDocuments(),
      
      // Total products
      Product.countDocuments(),
      
      // Total revenue (from delivered orders)
      Order.aggregate([
        { $match: { status: "delivered" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]),
      
      // Recent 10 orders
      Order.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      
      // Recent 5 users
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("-password")
        .lean(),
      
      // Pending orders count
      Order.countDocuments({ order_status: "Placed" }),     
    ]);

    // Calculate order stats
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate monthly revenue (last 6 months)
    const monthlyRevenue = await Order.aggregate([
      {
        $match: { 
          status: "delivered",
          createdAt: { 
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) 
          }
        }
      },
      {
        $group: {
          _id: { 
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalOrders,
          totalProducts,
          totalRevenue: totalRevenue[0]?.total || 0,
          pendingOrders,
        },
        orderStats: orderStats.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        recentOrders,
        recentUsers,
        monthlyRevenue,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message
    });
  }
};