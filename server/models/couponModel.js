import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true }, // e.g., WELCOME50
    discountType: { type: String, required: true, enum: ['flat', 'percent'] }, // Flat ₹50 off or 10% off
    discountValue: { type: Number, required: true }, // 50 or 10 based on type
    minCartValue: { type: Number, required: true, default: 0 }, // Minimum order amount to use this
    isActive: { type: Boolean, default: true },
    date: { type: Number, required: true }
});

const couponModel = mongoose.models.coupon || mongoose.model("coupon", couponSchema);
export default couponModel;