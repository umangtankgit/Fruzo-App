import express from "express";
import fileUpload from "express-fileupload"; // Brought this in from server.js
import { 
    register, 
    verifyRegistrationOTP, 
    login, 
    isAuth, 
    logout, 
    sendPasswordResetOTP, 
    resetPassword, 
    updateProfile,
    updateProfilePhoto,
    removeProfilePhoto,
    updateWishlist // <-- FIXED: Added missing import here!
} from "../controllers/userController.js";
import userAuth from "../middlewares/userAuth.js"; 

const router = express.Router();

// Auth Routes
router.post('/register', register);
router.post('/verify-registration', verifyRegistrationOTP);
router.post('/login', login);
router.get('/logout', logout);
router.get('/is-auth', userAuth, isAuth);

// Password Reset Routes
router.post('/send-reset-otp', sendPasswordResetOTP);
router.post('/reset-password', resetPassword);

// Profile Management Route
router.post('/update-profile', userAuth, updateProfile);

// ==========================================
// NEW: Wishlist Route
// ==========================================
router.post('/update-wishlist', userAuth, updateWishlist); // <-- FIXED: Added route here!

// ==========================================
// Photo Routes (Protected by local fileUpload)
// ==========================================
// We pass fileUpload() specifically to this route so it doesn't break Multer!
router.post('/update-photo', userAuth, fileUpload({ useTempFiles: true }), updateProfilePhoto);
router.post('/remove-photo', userAuth, removeProfilePhoto);

export default router;