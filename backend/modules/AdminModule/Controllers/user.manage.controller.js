// user.manage.controller.js
import User from "../../userAuth/Models/auth.model.js";
import Order from "../../OrderModule/model/orderModel.js";
import bcrypt from "bcryptjs";

// ============= GET ALL USERS =============

export const getUsers = async (req, res) => {
  try {
    console.log("req query...:", req.query);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const role = req.query.role || "";
    const status = req.query.status || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    if (role) filter.role = role;
    if (status) filter.status = status;

    // Get users with pagination
    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .select("-password -__v")
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    // Get order count for each user
    const userIds = users.map((user) => user._id);
    const orderCounts = await Order.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: "$userId", count: { $sum: 1 } } },
    ]);

    // Merge order counts with users
    const usersWithOrders = users.map((user) => {
      const orderCount = orderCounts.find(
        (oc) => oc._id.toString() === user._id.toString(),
      );
      return {
        ...user,
        orderCount: orderCount?.count || 0,
      };
    });

    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      success: true,
      data: {
        users: usersWithOrders,
        pagination: {
          page,
          limit,
          total: totalUsers,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// ============= GET USER STATISTICS =============

export const getUserStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(today.setDate(today.getDate() - 7));
    const startOfMonth = new Date(today.setDate(1));
    const startOfYear = new Date(today.setMonth(0, 1));

    // Get all stats in parallel
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      suspendedUsers,
      verifiedUsers,
      unverifiedUsers,
      newToday,
      newThisWeek,
      newThisMonth,
    ] = await Promise.all([
      // Total users
      User.countDocuments(),

      // Active users
      User.countDocuments({ status: "active" }),

      // Inactive users
      User.countDocuments({ status: "inactive" }),

      // Suspended users
      User.countDocuments({ status: "suspended" }),

      // Verified users
      User.countDocuments({ isVerified: true }),

      // Unverified users
      User.countDocuments({ isVerified: false }),

      // New users today
      User.countDocuments({ createdAt: { $gte: startOfDay } }),

      // New users this week
      User.countDocuments({ createdAt: { $gte: startOfWeek } }),

      // New users this month
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
    ]);

    // Calculate growth percentages
    const lastWeekUsers = await User.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 14)),
        $lt: new Date(new Date().setDate(new Date().getDate() - 7)),
      },
    });

    const userGrowth =
      lastWeekUsers > 0
        ? ((newThisWeek - lastWeekUsers) / lastWeekUsers) * 100
        : 0;

    res.status(200).json({
      success: true,
      data: {
        overview: {
          total: totalUsers,
          active: activeUsers,
          inactive: inactiveUsers,
          suspended: suspendedUsers,
          verified: verifiedUsers,
          unverified: unverifiedUsers,
        },
        newUsers: {
          today: newToday,
          thisWeek: newThisWeek,
          thisMonth: newThisMonth,
        },
        growth: {
          weeklyGrowth: Math.round(userGrowth * 100) / 100,
          monthlyGrowth:
            Math.round(
              ((newThisMonth - newThisWeek) / (newThisWeek || 1)) * 100,
            ) / 100,
        },

        lastUpdated: new Date(),
      },
    });
  } catch (error) {
    console.error("User stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user statistics",
      error: error.message,
    });
  }
};

// ============= GET SINGLE USER =============

export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    // Get user details
    const user = await User.findOne({ userId: userId })
      .select("-password -__v")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user orders
    const [orders, orderStats, totalSpent] = await Promise.all([
      Order.find({ userId }).sort({ createdAt: -1 }).limit(50).lean(),

      Order.aggregate([
        { $match: { userId: user._id } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      Order.aggregate([
        {
          $match: {
            userId: user._id,
            status: "delivered",
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

    // Get user activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = await Order.find({
      userId: user._id,
      createdAt: { $gte: thirtyDaysAgo },
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        user,
        orders: {
          list: orders,
          total: orders.length,
          stats: orderStats,
          totalSpent: totalSpent[0]?.total || 0,
        },
        recentActivity,
        lastUpdated: new Date(),
      },
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user details",
      error: error.message,
    });
  }
};

// ============= UPDATE USER STATUS =============

export const updateUserStatus = async (req, res) => {
  try {
    console.log("hit update User status...")
    const userId = req.params.id;
    const { status, reason } = req.body;
    console.log("status:",status,"reason:",reason)

    // Validate status
    const validStatuses = ["active", "inactive","suspended"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be: active, inactive, or suspended",
      });
    }

    // Check if user exists
    const user = await User.findOne({ userId: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Don't allow admin to suspend themselves
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot change status of your own account",
      });
    }

    // Update user status
    user.status = status;
    if (reason) {
      user.statusReason = reason;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `User status updated to ${status} successfully`,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          status: user.status,
          statusReason: user.statusReason || null,
        },
      },
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user status",
      error: error.message,
    });
  }
};

// ============= DELETE USER =============

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user exists
    const user = await User.findOne({ userId: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user has pending orders
    const pendingOrders = await Order.countDocuments({
      userId: userId,
      status: { $in: ["pending", "processing", "shipped"] },
    });

    if (pendingOrders > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete user. They have ${pendingOrders} pending order(s)`,
      });
    }

    await Promise.all([User.findOneAndDelete({ userId: userId })]);

    console.log(`User ${userId} deleted by admin`);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: {
        deletedUser: {
          userId: user.userId,
          name: user.firstName + " " + user.lastName,
          email: user.email,
        },
      },
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};
