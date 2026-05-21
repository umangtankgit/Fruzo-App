import express from 'express';
import { sellerLogin, isSellerAuth, sellerLogout, getDashboardData } from '../controllers/sellerController.js';
import authSeller from '../middlewares/authSeller.js';

const sellerRouter = express.Router();

// Existing Routes
sellerRouter.post('/login', sellerLogin);
sellerRouter.get('/is-auth', authSeller, isSellerAuth);
sellerRouter.post('/logout', sellerLogout);

// ==========================================
// NEW: DASHBOARD ROUTE
// ==========================================
// Protected by authSeller so only the admin can see the revenue/stock data
sellerRouter.get('/dashboard', authSeller, getDashboardData);

export default sellerRouter;