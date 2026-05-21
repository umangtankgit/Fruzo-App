import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: Array, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    offerPrice: { type: Number, required: true },
    
    // ZEPTO-STYLE UNIT MEASUREMENT
    unit: { type: String, default: "1 pc" }, 
    quantity: { type: Number, default: 0 }, 
    
    // ==========================================
    // FIXED: THE MISSING INSTOCK FIELD
    // ==========================================
    inStock: { type: Boolean, default: true }, // Default 'true' means status button ON rahega
    
    image: { type: Array, required: true },
    averageRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    sellerInfo: { type: Object, default: {} }
}, { timestamps: true });

const Product = mongoose.models.product || mongoose.model('product', productSchema);
export default Product;