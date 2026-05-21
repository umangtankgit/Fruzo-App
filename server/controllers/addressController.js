import Address from "../models/Address.js";
import User from "../models/User.js"; 

export const addAddress = async (req, res) => {
    try {
        console.log("📦 EXACT PAYLOAD FROM FRONTEND:", req.body);

        // Sometimes React wraps data in an object like { address: {...} }
        const data = req.body.address || req.body.formData || req.body.data || req.body;
        const userId = req.body.userId || data.userId;

        const user = await User.findById(userId);

        // 🚀 SMART MAPPING: Matches whatever variable names your frontend is actually sending
        const newAddress = new Address({
            userId: userId,
            firstName: data.firstName || data.name || data.fName || user?.name || "Customer",
            lastName: data.lastName || data.lName || "",
            phone: data.phone || data.mobile || data.contact || user?.phone || "",
            street: data.street || data.address || data.streetAddress || data.addressLine || "",
            city: data.city || data.town || "",
            state: data.state || data.region || "",
            zipcode: data.zipcode || data.pincode || data.zip || data.pin || ""
        });

        await newAddress.save();

        // THE "SET AS DEFAULT" LOGIC
        const isDefault = data.isDefault || req.body.isDefault;
        if (isDefault === true || isDefault === 'true') {
            await User.findByIdAndUpdate(userId, { defaultAddress: newAddress._id });
        }

        res.json({ success: true, message: "Address saved successfully!", address: newAddress });
    } catch (error) {
        console.log("❌ Error in addAddress:", error);
        res.json({ success: false, message: error.message });
    }
};

export const getAddress = async (req, res) => {
    try {
        const { userId } = req.body;
        const addresses = await Address.find({ userId }).sort({ createdAt: -1 });
        
        res.json({ success: true, addresses });
    } catch (error) {
        console.log("Error in getAddress:", error);
        res.json({ success: false, message: error.message });
    }
};

export const deleteAddress = async (req, res) => {
    try {
        const { userId, addressId } = req.body;
        
        await Address.findByIdAndDelete(addressId);
        
        const user = await User.findById(userId);
        if (user && String(user.defaultAddress) === String(addressId)) {
            await User.findByIdAndUpdate(userId, { defaultAddress: null });
        }

        res.json({ success: true, message: "Address removed" });
    } catch (error) {
        console.log("Error in deleteAddress:", error);
        res.json({ success: false, message: error.message });
    }
};