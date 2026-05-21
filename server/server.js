import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';

// Configurations
import connectDB from './configs/db.js';
import connectCloudinary from './configs/cloudinary.js';

// Route Imports
import userRouter from './routes/userRoute.js';
import sellerRouter from './routes/sellerRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import addressRouter from './routes/addressRoute.js';
import orderRouter from './routes/orderRoute.js';
import couponRouter from './routes/couponRoute.js';
import analyticsRouter from './routes/analyticsRoute.js';
import weatherRouter from './routes/weatherRoute.js';
import clearanceRouter from './routes/clearanceRoute.js';
import settingsRouter from './routes/settingsRoute.js';

// WhatsApp Bot Import
import { startWhatsAppBot } from './whatsappBot.js';

// App Initialize
const app = express();
const PORT = process.env.PORT || 4000;

// Database & Cloudinary Connection
await connectDB();
await connectCloudinary();

// ==========================================
// MIDDLEWARES (Sirf EK CORS bypass for Viva)
// ==========================================
app.use(cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// ==========================================
// API ROUTES
// ==========================================
app.get('/', (req, res) => res.send("Fruzo API is Working Live!"));
app.use('/api/user', userRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);
app.use('/api/coupon', couponRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/clearance', clearanceRouter);
app.use('/api/settings', settingsRouter);

// ==========================================
// START EXPRESS SERVER FIRST (Fast Startup)
// ==========================================
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

    // ==========================================
    // DELAY WHATSAPP BOT (Prevents RAM Crash)
    // ==========================================
    console.log("Waiting 10 seconds before starting WhatsApp Bot to save memory...");
    
    setTimeout(() => {
        try {
            console.log("WhatsApp Bot Initializing...");
            startWhatsAppBot();
        } catch (error) {
            console.log("Bot Start Error:", error);
        }
    }, 10000); // 10 seconds delay
});