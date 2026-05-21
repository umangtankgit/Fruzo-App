import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {type: String, required: true, ref: 'user'},
    items: [{
        product: {type: String, required: true, ref: 'product'},
        quantity: {type: Number, required: true}
    }],
    amount: {type: Number, required: true},
    address: {type: String, required: true, ref: 'address'},
    status: {type: String, default: 'Order Placed'},
    paymentType: {type: String, required: true},
    isPaid: {type: Boolean, required: true, default: false},
    
    // COUPON FIELDS
    couponCode: { type: String, default: "" },
    discountValue: { type: Number, default: 0 },

    // ==========================================
    // NEW: DYNAMIC DELIVERY TIMING ENGINE
    // ==========================================
    deliveryPreference: { type: String, default: "Standard" }, // e.g., "2 Hours"
    expectedDeliveryDate: { type: Date, default: null }, // Exact Deadline
    deliveryFee: { type: Number, default: 0 }, // Rs. 150 or 0

    // LOGISTICS & CLAIMS
    deliveredAt: { type: Date, default: null }, 
    cancelledAt: { type: Date, default: null },
    
    isExchangeRequested: { type: Boolean, default: false },
    exchangeReason: { type: String, default: "" } 

},{ timestamps: true })

if (mongoose.models.order) {
    delete mongoose.models.order;
}

const Order = mongoose.models.order || mongoose.model('order', orderSchema);
export default Order;