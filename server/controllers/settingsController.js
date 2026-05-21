import Settings from '../models/Settings.js';

export const getStoreStatus = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({ isStoreOpen: true });
        }
        res.json({ success: true, isStoreOpen: settings.isStoreOpen });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const toggleStoreStatus = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({ isStoreOpen: true });
        }
        
        // Toggle the status
        settings.isStoreOpen = !settings.isStoreOpen;
        await settings.save();
        
        res.json({ 
            success: true, 
            isStoreOpen: settings.isStoreOpen, 
            message: settings.isStoreOpen ? "🟢 Store is now OPEN for Orders" : "🔴 Store is now CLOSED" 
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};