import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary'; 
import { sendOTPEmail } from "../configs/nodemailer.js"; // 🚀 Imported our new email function

// ==========================================
// IN-MEMORY OTP STORE
// ==========================================
const otpStore = new Map();
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// 1. Send OTP for Registration (Now via Email)
export const register = async (req, res) => {
    try {
        const { name, phone, email, password } = req.body;

        if (!name || !phone || !email || !password) {
            return res.json({ success: false, message: 'Name, Email, Phone, and Password are all required' });
        }

        // Check if email OR phone already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) return res.json({ success: false, message: 'User already exists with this Email' });
        
        const existingPhone = await User.findOne({ phone });
        if (existingPhone) return res.json({ success: false, message: 'User already exists with this Phone Number' });

        const otp = generateOTP();

        // Store by EMAIL instead of phone
        otpStore.set(email, { 
            otp, 
            expiry: Date.now() + 10 * 60 * 1000, 
            userData: { name, phone, email, password } 
        });

        // 🚀 ACTUALLY SEND THE EMAIL!
        await sendOTPEmail(email, name, otp);

        console.log(`\n======================================================`);
        console.log(`🚀 FRUZO DEV LOG: OTP sent to ${email} is: ${otp}`);
        console.log(`======================================================\n`);

        return res.json({ success: true, message: 'OTP sent to your email successfully!' });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// 2. Verify OTP & Create Account
export const verifyRegistrationOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const otpData = otpStore.get(email);

        if (!otpData) return res.json({ success: false, message: 'OTP expired or not requested' });

        if (Date.now() > otpData.expiry) {
            otpStore.delete(email);
            return res.json({ success: false, message: 'OTP has expired' });
        }
        
        if (otpData.otp !== otp) return res.json({ success: false, message: 'Invalid OTP' });

        const { name, phone, password } = otpData.userData;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({ 
            name, 
            phone, 
            email, 
            password: hashedPassword,
        });

        otpStore.delete(email);

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.json({ success: true, message: 'Account created successfully', user: { email: user.email, phone: user.phone, name: user.name, profilePhoto: user.profilePhoto } });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// 3. Login User (Now uses EMAIL instead of phone)
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) return res.json({ success: false, message: 'Email and password are required' });

        const user = await User.findOne({ email });

        if (!user) return res.json({ success: false, message: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.json({ success: false, message: 'Invalid email or password' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.json({ success: true, user: { email: user.email, phone: user.phone, name: user.name, profilePhoto: user.profilePhoto } });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}
// 4. Send Password Reset OTP (Converted to Email)
export const sendPasswordResetOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) return res.json({ success: false, message: 'No account found with this email' });

        const otp = generateOTP();
        otpStore.set(`reset_${email}`, { otp, expiry: Date.now() + 10 * 60 * 1000 });

        // 🚀 Sending OTP via Nodemailer
        await sendOTPEmail(email, user.name, otp);

        console.log(`\n======================================================`);
        console.log(`🔐 DEV MODE: Password Reset OTP for ${email} is: ${otp}`);
        console.log(`======================================================\n`);

        return res.json({ success: true, message: 'Password Reset OTP sent to your email' });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// 5. Verify OTP & Reset Password (Converted to Email)
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        const otpData = otpStore.get(`reset_${email}`);

        if (!otpData) return res.json({ success: false, message: 'OTP expired or not requested' });

        if (Date.now() > otpData.expiry) {
            otpStore.delete(`reset_${email}`);
            return res.json({ success: false, message: 'OTP has expired' });
        }
        if (otpData.otp !== otp) return res.json({ success: false, message: 'Invalid OTP' });

        // Hash new password and update database
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findOneAndUpdate({ email }, { password: hashedPassword });

        otpStore.delete(`reset_${email}`);

        return res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// 6. Update User Profile Data
export const updateProfile = async (req, res) => {
    try {
        const { userId, name, email, phone, profilePhoto, defaultAddress } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (phone) updateData.phone = phone;
        if (profilePhoto) updateData.profilePhoto = profilePhoto;
        if (defaultAddress) updateData.defaultAddress = defaultAddress;

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");

        if (!user) return res.json({ success: false, message: 'User not found' });

        return res.json({ success: true, message: 'Profile updated successfully', user });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// 7. Check Auth
export const isAuth = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId).select("-password").populate('defaultAddress');
        return res.json({ success: true, user });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// 8. Logout User
export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        return res.json({ success: true, message: "Logged Out" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// 9. Update Profile Photo
export const updateProfilePhoto = async (req, res) => {
    try {
        const { userId } = req.body;
        const imageFile = req.files?.image; 

        if (!imageFile) {
            return res.json({ success: false, message: "No image file provided" });
        }

        const imageUpload = await cloudinary.uploader.upload(imageFile.tempFilePath, { resource_type: "image" });
        const imageUrl = imageUpload.secure_url;

        const updatedUser = await User.findByIdAndUpdate(userId, { profilePhoto: imageUrl }, { new: true }).select("-password").populate('defaultAddress');
        res.json({ success: true, message: "Photo updated successfully", user: updatedUser });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// 10. Remove Profile Photo
export const removeProfilePhoto = async (req, res) => {
    try {
        const { userId } = req.body;
        const updatedUser = await User.findByIdAndUpdate(userId, { profilePhoto: "" }, { new: true }).select("-password").populate('defaultAddress');
        res.json({ success: true, message: "Photo removed successfully", user: updatedUser });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// 11. Sync Wishlist
export const updateWishlist = async (req, res) => {
    try {
        const { userId, wishlist } = req.body;
        await User.findByIdAndUpdate(userId, { wishlist }, { new: true });
        
        res.json({ success: true, message: "Wishlist synced successfully" });
    } catch (error) {
        console.log("Wishlist Sync Error:", error);
        res.json({ success: false, message: error.message });
    }
}