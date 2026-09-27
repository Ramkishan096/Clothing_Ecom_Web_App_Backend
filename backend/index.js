
import express from "express";
import OrderRouter from "./modules/OrderModule/routes/orderRoutes.js";
import ShiprocketRouter from "./modules/Shipment/Routes/shiprocket_routes.js"
import ShiprocketTestRoutes from "./modules/Shipment/Routes/shiprokcet_test_routes.js"
import ProductRouter from "./modules/ProductModule/product.routes.js";
import RazorpayRouter from "./modules/RazorpaySystem/Routes/razorpay.system.test.routes.js"
import AuthRouter from "./modules/userAuth/routes/auth.routes.js";
import ImageUploadRouter from "./modules/CloundinaryModule/CloudinaryRoutes.js";
import AdminRouter from "./modules/AdminModule/Routes/admin.routes.js"

const mainRouter = express.Router();



mainRouter.use('/order',OrderRouter)
mainRouter.use("/razorpay",RazorpayRouter)
mainRouter.use('/Shiprocket',ShiprocketRouter)
mainRouter.use('/T/Shiprocket',ShiprocketTestRoutes)
mainRouter.use('/product',ProductRouter)
mainRouter.use("/auth", AuthRouter);
mainRouter.use("/uploadsimages",ImageUploadRouter)
mainRouter.use("/admin",AdminRouter)

export default mainRouter;

// http://localhost:5000/api/v1/    routes are here