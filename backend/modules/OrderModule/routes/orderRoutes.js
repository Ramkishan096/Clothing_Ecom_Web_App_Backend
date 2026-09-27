import express from "express";
import { cancelOrder, createOrder, createPayment, getAllOrder, getBuyerOrders, getOrder, updateOrderStatus } from "../controllers/orderController.js";
import { verifyPaymentMiddleware } from "../middleware/verifyPayment.js";
import { isAdmin, verifyToken } from "../../userAuth/middlewares/auth.middleware.js";


const router = express.Router();


router.post('/create-payment', verifyToken,createPayment);
router.post('/create-order', verifyToken,verifyPaymentMiddleware, createOrder);
router.get("/buyerOrder",verifyToken, getBuyerOrders);

// Order management routes
router.get('/:order_id',verifyToken, getOrder);
router.put('/:order_id/status',verifyToken, updateOrderStatus);
router.put('/:order_id/cancel', verifyToken, cancelOrder);



// admin route 
router.get('/',verifyToken,isAdmin,getAllOrder)


export default router;