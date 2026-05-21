import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import connectDB from './configs/db.js';
import 'dotenv/config';
import userRouter from './routes/userRoute.js';
import sellerRouter from './routes/sellerRoute.js';
import connectCloudinary from './configs/cloudinary.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import addressRouter from './routes/addressRoute.js';
import orderRouter from './routes/orderRoute.js';
import couponRouter from './routes/couponRoute.js';
import analyticsRouter from './routes/analyticsRoute.js';
import { startWhatsAppBot } from './whatsappBot.js';
import weatherRouter from './routes/weatherRoute.js';
import clearanceRouter from './routes/clearanceRoute.js';
import settingsRouter from './routes/settingsRoute.js';

const app = express();
const port = process.env.PORT || 4000;

await connectDB();
await connectCloudinary();

// Wapas pehle jaisa strict kar diya
const allowedOrigins = ['http://localhost:5173', ''];

app.use(cors({origin: allowedOrigins, credentials: true}));
// 10.18.127.152
// Middleware configuration
app.use(express.json());
app.use(cookieParser());
app.use('/api/weather', weatherRouter);
app.use('/api/clearance', clearanceRouter);
app.use('/api/settings', settingsRouter);

app.get('/', (req, res) => res.send("API is Working"));
app.use('/api/user', userRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);
app.use('/api/coupon', couponRouter);
app.use('/api/analytics', analyticsRouter);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    // Start the WhatsApp Bot!
    try {
        startWhatsAppBot();
    } catch (error) {
        console.log("WhatsApp bot failed to start:", error);
    }
});