import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import { sendOrderConfirmationEmail } from "../configs/nodemailer.js";
import { sendWhatsAppMessage } from "../whatsappBot.js";

const MIN_ORDER_AMOUNT = 500; // ✅ Minimum order amount (server-side enforcement)

// ==========================================
// INVENTORY MANAGEMENT HELPER FUNCTIONS
// ==========================================
const reduceStock = async (orderItems) => {
    for (const item of orderItems) {
        const productId = item.product?._id || item.product || item._id;
        if (productId) {
            await Product.findByIdAndUpdate(productId, {
                $inc: { quantity: -item.quantity } 
            });
        }
    }
};

const restoreStock = async (orderItems) => {
    for (const item of orderItems) {
        const productId = item.product?._id || item.product || item._id;
        if (productId) {
            await Product.findByIdAndUpdate(productId, {
                $inc: { quantity: item.quantity } 
            });
        }
    }
};

export const placeOrderCOD = async (req, res) => {
    try {
        const { userId, items, address, couponCode, discountValue, deliveryPreference, deliveryFee } = req.body;
        
        if (!address || items.length === 0) {
            return res.json({ success: false, message: "Invalid data" });
        }
        
        let amount = 0;
        for (const item of items) {
            const productId = item.product?._id || item.product || item._id;
            const product = await Product.findById(productId);
            if (product) {
                const priceToUse = product.offerPrice || product.price || 0;
                amount += (priceToUse * item.quantity);
            }
        }

        if (amount <= 0) {
            return res.json({ success: false, message: "Cart total is 0. Cannot place order." });
        }

        // ✅ Server-side minimum order check (before applying discount)
        if (amount < MIN_ORDER_AMOUNT) {
            return res.json({ 
                success: false, 
                message: `Minimum order amount is ₹${MIN_ORDER_AMOUNT}. Your cart total is ₹${amount}.` 
            });
        }

        if (discountValue) {
            amount = amount - discountValue;
        }

        amount += Math.floor(amount * 0.02); // 2% Tax
        amount += (deliveryFee || 0); // EXPRESS FEE ADDED

        // Calculate Exact Delivery Deadline
        let expectedDeliveryDate = new Date();
        const hoursToAdd = parseInt(deliveryPreference) || 3; // Default 3 hours
        expectedDeliveryDate.setHours(expectedDeliveryDate.getHours() + hoursToAdd);

        const order = await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "COD",
            couponCode: couponCode || null,
            discountValue: discountValue || 0,
            deliveryPreference: deliveryPreference + " Hours", 
            expectedDeliveryDate, 
            deliveryFee: deliveryFee || 0
        });

        await reduceStock(items);

        const user = await User.findById(userId);
        if (user && user.email) {
            const orderDetailsForEmail = {
                _id: order._id,
                address: address,
                amount: amount,
                paymentMethod: "Cash on Delivery",
                deliveryPreference: deliveryPreference + " Hours",
                expectedDeliveryDate: expectedDeliveryDate,
                deliveryFee: deliveryFee || 0,
                items: await Promise.all(items.map(async (item) => {
                    const productId = item.product?._id || item.product || item._id;
                    const product = await Product.findById(productId);
                    return { name: product ? product.name : "Product", quantity: item.quantity };
                }))
            };
            sendOrderConfirmationEmail(user.email, orderDetailsForEmail); 
        }

        return res.json({ success: true, message: "Order Placed Successfully" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const placeOrderRazorpay = async (req, res) => {
    try {
        const { userId, items, address, couponCode, discountValue, deliveryPreference, deliveryFee } = req.body;

        if (!address || items.length === 0) {
            return res.json({ success: false, message: "Invalid data" });
        }

        let amount = 0;
        for (const item of items) {
            const productId = item.product?._id || item.product || item._id;
            const product = await Product.findById(productId);
            if (product) {
                const priceToUse = product.offerPrice || product.price || 0;
                amount += (priceToUse * item.quantity);
            }
        }

        if (amount <= 0) {
            return res.json({ success: false, message: "Order amount must be greater than 0." });
        }

        // ✅ Server-side minimum order check (before applying discount)
        if (amount < MIN_ORDER_AMOUNT) {
            return res.json({ 
                success: false, 
                message: `Minimum order amount is ₹${MIN_ORDER_AMOUNT}. Your cart total is ₹${amount}.` 
            });
        }

        if (discountValue) {
            amount = amount - discountValue;
        }

        if (amount < 1) {
            return res.json({ success: false, message: "Order amount must be at least ₹1 for online payments." });
        }

        amount += Math.floor(amount * 0.02); 
        amount += (deliveryFee || 0); // EXPRESS FEE ADDED

        // Calculate Exact Delivery Deadline
        let expectedDeliveryDate = new Date();
        const hoursToAdd = parseInt(deliveryPreference) || 3; 
        expectedDeliveryDate.setHours(expectedDeliveryDate.getHours() + hoursToAdd);

        const order = await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "Razorpay",
            couponCode: couponCode || null,
            discountValue: discountValue || 0,
            deliveryPreference: deliveryPreference + " Hours", 
            expectedDeliveryDate, 
            deliveryFee: deliveryFee || 0
        });

        const razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_SfUoUFHQYqa2mk",
            key_secret: process.env.RAZORPAY_KEY_SECRET || "vgLwVjrhCugKBvNYmi6ApKYM",
        });
        
        const options = {
            amount: Math.round(amount * 100), 
            currency: "INR",
            receipt: order._id.toString(),
        };

        const razorpayOrder = await razorpayInstance.orders.create(options);

        return res.json({ success: true, order: razorpayOrder });
    } catch (error) {
        return res.json({ 
            success: false, 
            message: error.error?.description || error.message || "Payment Gateway Error" 
        });
    }
};

export const verifyRazorpayPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            const order = await Order.findByIdAndUpdate(orderId, { isPaid: true }, { new: true });
            
            await reduceStock(order.items);
            await User.findByIdAndUpdate(order.userId, { cartItems: {} });

            const user = await User.findById(order.userId);
            if (user && user.email) {
                const populatedOrder = await order.populate('items.product');
                const orderDetailsForEmail = {
                    _id: populatedOrder._id,
                    address: populatedOrder.address,
                    amount: populatedOrder.amount,
                    paymentMethod: "Razorpay (Online Paid)",
                    deliveryPreference: populatedOrder.deliveryPreference,
                    expectedDeliveryDate: populatedOrder.expectedDeliveryDate,
                    deliveryFee: populatedOrder.deliveryFee || 0,
                    items: populatedOrder.items.map(item => ({
                        name: item.product ? item.product.name : "Product",
                        quantity: item.quantity
                    }))
                };
                sendOrderConfirmationEmail(user.email, orderDetailsForEmail);
            }

            return res.json({ success: true, message: "Payment Verified Successfully" });
        } else {
            await Order.findByIdAndDelete(orderId);
            return res.json({ success: false, message: "Payment Verification Failed" });
        }
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const { userId } = req.body;
        const orders = await Order.find({
            userId,
            $or: [{ paymentType: "COD" }, { isPaid: true }],
        }).populate("items.product address").sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            $or: [{ paymentType: "COD" }, { isPaid: true }],
        }).populate("items.product address").sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        const order = await Order.findById(orderId).populate('address');
        
        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        let updateData = { status };

        if (status === 'Delivered') {
            updateData.deliveredAt = new Date();
            if (order.paymentType === 'COD') {
                updateData.isPaid = true;
            }

            // ==========================================
            // 🚀 AUTO WHATSAPP NOTIFICATION
            // ==========================================
            try {
                const user = await User.findById(order.userId);
                if (user && user.phone) {
                    let waMessage = `🚚 *ORDER DELIVERED!*\n\n`;
                    waMessage += `Hi ${user.name},\n`;
                    waMessage += `Your order #${order._id.toString().slice(-8).toUpperCase()} has been successfully delivered to ${order.address.street || 'your address'}.\n\n`;
                    waMessage += `Thank you for shopping with Fruzo! We hope you enjoy your fresh fruits! 🍎🥝`;
                    
                    sendWhatsAppMessage(user.phone, waMessage);
                }
            } catch (waError) {
                console.log("WhatsApp Notification failed silently:", waError);
            }
        }

        if (status === 'Rejected by Seller') {
            updateData.cancelledAt = new Date();
            await restoreStock(order.items);
        }

        if (status === 'Refunded') {
            updateData.isExchangeRequested = false; 
            updateData.exchangeReason = order.exchangeReason + " (Resolved: Amount Refunded)";
        }

        if (status === 'Exchange Approved') {
            await reduceStock(order.items);
            updateData.isExchangeRequested = false; 
            updateData.exchangeReason = order.exchangeReason + " (Resolved: Replacement Shipped)";
        }

        await Order.findByIdAndUpdate(orderId, updateData);
        res.json({ success: true, message: `Order updated to ${status}` });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const { userId, orderId } = req.body;
        const order = await Order.findOne({ _id: orderId, userId: userId });

        if (!order) return res.json({ success: false, message: "Order not found" });
        
        if (order.status !== 'Order Placed') {
            return res.json({ success: false, message: "Too late to cancel!" });
        }

        await Order.findByIdAndUpdate(orderId, { 
            status: 'Cancelled by Customer', 
            cancelledAt: new Date() 
        });

        await restoreStock(order.items);
        res.json({ success: true, message: "Order cancelled successfully." });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const requestExchange = async (req, res) => {
    try {
        const { userId, orderId, reason } = req.body;
        const order = await Order.findOne({ _id: orderId, userId: userId });

        if (!order || order.status !== 'Delivered') {
            return res.json({ success: false, message: "Invalid request." });
        }

        await Order.findByIdAndUpdate(orderId, { 
            status: 'Exchange Requested',
            isExchangeRequested: true,
            exchangeReason: reason
        });

        res.json({ success: true, message: "Issue reported successfully." });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};