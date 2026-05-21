import express from 'express';
import authUser from '../middlewares/authUser.js';
import { 
    getAllOrders, 
    getUserOrders, 
    placeOrderCOD, 
    placeOrderRazorpay, 
    verifyRazorpayPayment, 
    updateStatus,
    cancelOrder,
    requestExchange
} from '../controllers/orderController.js';
import authSeller from '../middlewares/authSeller.js';

const orderRouter = express.Router();

orderRouter.post('/cod', authUser, placeOrderCOD);
orderRouter.get('/user', authUser, getUserOrders);
orderRouter.get('/seller', authSeller, getAllOrders);

// Razorpay Routes
orderRouter.post('/razorpay', authUser, placeOrderRazorpay);
orderRouter.post('/verifyRazorpay', authUser, verifyRazorpayPayment);

// Seller Status Update
orderRouter.post('/status', authSeller, updateStatus);

// NEW: Real-World Logistics Routes (Customer Actions)
orderRouter.post('/cancel', authUser, cancelOrder);
orderRouter.post('/exchange', authUser, requestExchange);

export default orderRouter;