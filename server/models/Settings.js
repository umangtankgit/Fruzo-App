import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
    isStoreOpen: { type: Boolean, default: true }
});

const Settings = mongoose.models.settings || mongoose.model('settings', settingsSchema);
export default Settings;