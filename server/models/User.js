import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    defaultAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'address' },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'product' }],
    // 🚀 FIXED: Added profilePhoto field so Mongoose actually saves the URL!
    profilePhoto: { type: String, default: "" }
}, { minimize: false, timestamps: true });

const User = mongoose.models.user || mongoose.model('user', userSchema);
export default User;