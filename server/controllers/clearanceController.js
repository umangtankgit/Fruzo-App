import Product from '../models/Product.js';

// 1. Fetch Aging Inventory
export const getAgingInventory = async (req, res) => {
    try {
        const { thresholdDays } = req.query;
        const days = parseInt(thresholdDays) || 3; 
        
        // Calculate the date X days ago
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - days);

        // Find products that are in stock and older than the threshold
        const products = await Product.find({
            inStock: true,
            createdAt: { $lte: dateThreshold }
        });

        res.json({ success: true, count: products.length, products });
    } catch (error) {
        console.log("Error fetching aging inventory:", error);
        res.json({ success: false, message: error.message });
    }
};

// 2. Automatically Apply Flash Discounts
export const triggerAutoClearance = async (req, res) => {
    try {
        const { thresholdDays, discountPercentage } = req.body;
        const days = parseInt(thresholdDays) || 3;
        const discount = parseFloat(discountPercentage) || 30; // Default 30% off

        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - days);

        // Find applicable products
        const productsToClear = await Product.find({
            inStock: true,
            createdAt: { $lte: dateThreshold },
            // Optional: You can add a field in schema like isFlashClearance to avoid double discounting
        });

        if (productsToClear.length === 0) {
            return res.json({ success: true, message: "No aging products found to clearance.", updatedCount: 0 });
        }

        let updatedCount = 0;

        // Loop and apply markdown
        for (let product of productsToClear) {
            const currentPrice = product.price;
            // Calculate new price after discount
            const markdownPrice = Math.floor(currentPrice - (currentPrice * (discount / 100)));
            
            // Update product in database
            await Product.findByIdAndUpdate(product._id, {
                offerPrice: markdownPrice,
                // Appending a flash tag to the description or name for UI visibility
                name: product.name.includes('⚡ FLASH SALE') ? product.name : `⚡ FLASH SALE: ${product.name}`
            });
            updatedCount++;
        }

        res.json({ 
            success: true, 
            message: `Successfully applied ${discount}% Flash Markdown to ${updatedCount} aging products!`,
            updatedCount 
        });

    } catch (error) {
        console.log("Error triggering clearance:", error);
        res.json({ success: false, message: error.message });
    }
};