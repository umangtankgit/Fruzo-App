import couponModel from "../models/couponModel.js";

// 1. Admin: Create a new Coupon
export const createCoupon = async (req, res) => {
    try {
        const { code, discountType, discountValue, minCartValue } = req.body;

        // Check if coupon already exists
        const existingCoupon = await couponModel.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.json({ success: false, message: "Coupon code already exists!" });
        }

        const newCoupon = new couponModel({
            code,
            discountType,
            discountValue,
            minCartValue,
            date: Date.now()
        });

        await newCoupon.save();
        res.json({ success: true, message: "Coupon Created Successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 2. Admin: Get all Coupons
export const listCoupons = async (req, res) => {
    try {
        const coupons = await couponModel.find({});
        res.json({ success: true, coupons });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 3. Admin: Delete a Coupon
export const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.body;
        await couponModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Coupon Deleted Successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 4. User: Apply a Coupon (Validation)
export const applyCoupon = async (req, res) => {
    try {
        const { code, cartAmount } = req.body;

        const coupon = await couponModel.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.json({ success: false, message: "Invalid Coupon Code" });
        }
        if (!coupon.isActive) {
            return res.json({ success: false, message: "This coupon is no longer active" });
        }
        if (cartAmount < coupon.minCartValue) {
            return res.json({ success: false, message: `Minimum cart value must be ₹${coupon.minCartValue}` });
        }

        // Calculate Discount
        let discountAmount = 0;
        if (coupon.discountType === 'flat') {
            discountAmount = coupon.discountValue;
        } else if (coupon.discountType === 'percent') {
            discountAmount = (cartAmount * coupon.discountValue) / 100;
        }

        res.json({ 
            success: true, 
            message: "Coupon Applied!", 
            discountAmount, 
            couponData: coupon 
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};