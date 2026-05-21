import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

export const getDashboardData = async (req, res) => {
    try {
        const { timeframe } = req.query;
        let dateQuery = {};
        const now = new Date();
        
        // Exact time calculations for Today and Yesterday
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfYesterday = new Date(startOfToday.getTime() - (24 * 60 * 60 * 1000));

        if (timeframe === 'today') {
            dateQuery.createdAt = { $gte: startOfToday };
        } else if (timeframe === 'yesterday') {
            dateQuery.createdAt = { $gte: startOfYesterday, $lt: startOfToday };
        } else if (timeframe === '7days') {
            dateQuery.createdAt = { $gte: new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)) };
        } else if (timeframe === '30days') {
            dateQuery.createdAt = { $gte: new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)) };
        }

        const totalProducts = await Product.countDocuments();
        const totalUsers = await User.countDocuments();
        
        // Fetch valid orders
        const orders = await Order.find({
            ...dateQuery,
            $or: [{ paymentType: "COD" }, { isPaid: true }]
        }).populate("items.product");

        let totalRevenue = 0;
        let b2bRevenue = 0;
        let retailRevenue = 0;
        const dailyRevenueMap = {};
        const topProductsMap = {};
        const orderStatusMap = {};
        const promoCodeMap = {};

        orders.forEach(order => {
            totalRevenue += order.amount;

            // B2B Logic
            let orderItemCount = 0;
            order.items.forEach(item => { orderItemCount += item.quantity; });
            if (orderItemCount >= 10 || order.amount >= 2000) {
                b2bRevenue += order.amount;
            } else {
                retailRevenue += order.amount;
            }

            // Daily Trend (For area chart)
            const dateKey = new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
            dailyRevenueMap[dateKey] = (dailyRevenueMap[dateKey] || 0) + order.amount;

            // Order Status
            const status = order.status || "Order Placed";
            orderStatusMap[status] = (orderStatusMap[status] || 0) + 1;

            // Promo Code Analytics
            if (order.couponCode && order.couponCode.trim() !== "") {
                const code = order.couponCode.toUpperCase();
                if (!promoCodeMap[code]) {
                    promoCodeMap[code] = { usageCount: 0, totalDiscountGiven: 0, revenueGenerated: 0 };
                }
                promoCodeMap[code].usageCount += 1;
                promoCodeMap[code].totalDiscountGiven += (order.discountValue || 0);
                promoCodeMap[code].revenueGenerated += order.amount;
            }

            // Top Products
            order.items.forEach(item => {
                if (item.product && item.product.name) {
                    const name = item.product.name;
                    if (!topProductsMap[name]) topProductsMap[name] = { quantitySold: 0, revenue: 0 };
                    topProductsMap[name].quantitySold += item.quantity;
                    topProductsMap[name].revenue += ((item.product.offerPrice || item.product.price) * item.quantity);
                }
            });
        });

        const charts = {
            dailyTrendData: Object.keys(dailyRevenueMap).map(date => ({ date, Revenue: dailyRevenueMap[date] })),
            topProductsData: Object.keys(topProductsMap).map(name => ({ name, Revenue: topProductsMap[name].revenue })).sort((a,b) => b.Revenue - a.Revenue).slice(0, 5),
            orderStatusData: Object.keys(orderStatusMap).map(name => ({ name, value: orderStatusMap[name] })),
            promoCodeData: Object.keys(promoCodeMap).map(code => ({ code, ...promoCodeMap[code] })).sort((a,b) => b.usageCount - a.usageCount)
        };

        const lowStockProducts = await Product.find({ quantity: { $lt: 10 } }).sort({ quantity: 1 }).limit(5);

        res.json({ success: true, stats: { totalRevenue, totalOrders: orders.length, totalProducts, totalUsers, b2bRevenue, retailRevenue }, charts, lowStockProducts });

    } catch (error) {
        console.error("Analytics Error:", error);
        res.json({ success: false, message: error.message });
    }
};