import { v2 as cloudinary } from "cloudinary"
import Product from "../models/Product.js"
import Order from "../models/Order.js"

// Add Product : /api/product/add
export const addProduct = async (req, res)=>{
    try {
        let productData = JSON.parse(req.body.productData)

        const images = req.files

        let imagesUrl = await Promise.all(
            images.map(async (item)=>{
                let result = await cloudinary.uploader.upload(item.path, {resource_type: 'image'});
                return result.secure_url
            })
        )

        await Product.create({...productData, image: imagesUrl})
        res.json({success: true, message: "Product Added Successfully"})

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Get Product : /api/product/list
export const productList = async (req, res)=>{
    try {
        const products = await Product.find({})
        res.json({success: true, products})
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Get single Product : /api/product/id
export const productById = async (req, res)=>{
    try {
        const { id } = req.body
        const product = await Product.findById(id)
        res.json({success: true, product})
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Change Product inStock : /api/product/stock
export const changeStock = async (req, res)=>{
    try {
        const { id, inStock } = req.body
        await Product.findByIdAndUpdate(id, {inStock})
        res.json({success: true, message: "Stock Status Updated"})
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// ==========================================
// FULL CRUD OPERATIONS
// ==========================================

export const editProduct = async (req, res) => {
    try {
        const { id } = req.body;
        let productData = JSON.parse(req.body.productData);

        let updateFields = { ...productData };

        if (req.files && req.files.length > 0) {
            const images = req.files;
            let imagesUrl = await Promise.all(
                images.map(async (item) => {
                    let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                    return result.secure_url;
                })
            );
            updateFields.image = imagesUrl; 
        }

        if (updateFields.quantity !== undefined) {
            updateFields.inStock = Number(updateFields.quantity) > 0;
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, updateFields, { new: true });
        
        if (!updatedProduct) {
            return res.json({ success: false, message: "Product not found" });
        }

        res.json({ success: true, message: "Product Updated Successfully", product: updatedProduct });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.body;
        
        const deletedProduct = await Product.findByIdAndDelete(id);
        
        if (!deletedProduct) {
            return res.json({ success: false, message: "Product not found" });
        }

        res.json({ success: true, message: "Product completely deleted" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// ==========================================
// PRODUCT REVIEW LOGIC
// ==========================================
export const addProductReview = async (req, res) => {
    try {
        const { rating, comment, userName } = req.body;
        const productId = req.params.id;
        const userId = req.body.userId;

        const product = await Product.findById(productId);

        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }

        const userOrders = await Order.find({ userId: userId });
        let hasPurchased = false;

        for (const order of userOrders) {
            const itemExists = order.items.find((item) => {
                const itemProductId = item.product._id ? item.product._id.toString() : item.product.toString();
                return itemProductId === productId.toString();
            });

            if (itemExists) {
                hasPurchased = true;
                break; 
            }
        }

        if (!hasPurchased) {
            return res.json({ success: false, message: "You can only review products you have actually purchased!" });
        }

        const alreadyReviewed = product.reviews.find(
            (r) => r.userId.toString() === userId.toString()
        );

        if (alreadyReviewed) {
            return res.json({ success: false, message: "You have already reviewed this product" });
        }

        const review = {
            userId,
            name: userName, 
            rating: Number(rating),
            comment,
        };

        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.averageRating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

        await product.save();
        res.json({ success: true, message: "Review added successfully!" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// ==========================================
// PILLAR 2: BULK MANDI PRICING ENGINE
// ==========================================
export const updateBulkProducts = async (req, res) => {
    try {
        const { updates } = req.body;

        if (!updates || !Array.isArray(updates) || updates.length === 0) {
            return res.json({ success: false, message: "No data provided for update" });
        }

        // MongoDB bulkWrite requires an array of operations
        const bulkOps = updates.map(item => ({
            updateOne: {
                filter: { _id: item._id },
                update: { 
                    $set: { 
                        offerPrice: Number(item.offerPrice),
                        b2bPrice: Number(item.b2bPrice),
                        b2bMoq: Number(item.b2bMoq),
                        quantity: Number(item.quantity),
                        // Smart toggle: If quantity drops to 0, mark as out of stock instantly
                        inStock: Number(item.quantity) > 0 
                    } 
                }
            }
        }));

        // Execute all updates in a single high-speed database call
        const result = await Product.bulkWrite(bulkOps);

        res.json({ 
            success: true, 
            message: `Successfully updated ${result.modifiedCount} products in Mandi Rates!`,
        });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}