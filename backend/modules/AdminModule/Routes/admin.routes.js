// routes/dashboard.routes.js
import express from "express";
import { isAdmin, verifyToken } from "../../userAuth/middlewares/auth.middleware.js";

import { getDashboardStats } from "../Controllers/dashboard.controller.js";
import { deleteUser, getUserById, getUsers, getUserStats, updateUserStatus } from "../Controllers/user.manage.controller.js";

const router = express.Router();

// ============= DASHBOARD STATS ROUTES =============
router.get("/stats",verifyToken,isAdmin, getDashboardStats);

// ============= USER MANAGEMENT ROUTES =============
router.get("/users",verifyToken,isAdmin, getUsers);
router.get("/users/stats", verifyToken,isAdmin, getUserStats);
router.get("/users/:id", verifyToken,isAdmin, getUserById);
router.post("/users/:id",verifyToken,isAdmin, updateUserStatus);
router.delete("/users/:id",verifyToken,isAdmin, deleteUser);

export default router;