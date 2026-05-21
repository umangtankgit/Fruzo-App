import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    firstName: { type: String, default: "Customer" },
    lastName: { type: String, default: "" },
    phone: { type: String, default: "0000000000" }, // Changed to String to avoid Number cast errors
    street: { type: String, default: "N/A" },
    city: { type: String, default: "N/A" },
    state: { type: String, default: "N/A" },
    zipcode: { type: String, default: "000000" } // Changed to String to avoid Number cast errors
}, { timestamps: true });

if (mongoose.models.address) {
    delete mongoose.models.address;
}

const Address = mongoose.models.address || mongoose.model('address', addressSchema);
export default Address;