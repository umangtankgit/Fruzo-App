import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const FlashClearance = () => {
    const [agingProducts, setAgingProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Default to 0 for immediate Viva testing visibility
    const [thresholdDays, setThresholdDays] = useState(0); 
    const [discountParams, setDiscountParams] = useState(30);

    const fetchAgingInventory = async () => {
        setLoading(true);
        try {
           const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/clearance/aging?thresholdDays=${thresholdDays}`);
            if (data.success) {
                setAgingProducts(data.products);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Failed to fetch inventory");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAgingInventory();
    }, [thresholdDays]);

    const handleTriggerClearance = async () => {
        if(agingProducts.length === 0) return toast.error("No products to clear!");
        
        const confirmClear = window.confirm(`Are you sure you want to apply a ${discountParams}% markdown to ${agingProducts.length} items?`);
        if(!confirmClear) return;

        try {
            setLoading(true);
            const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/clearance/trigger`, {
                thresholdDays: thresholdDays,
                discountPercentage: discountParams
            });

            if (data.success) {
                toast.success(data.message);
                fetchAgingInventory(); // Refresh list
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Clearance automation failed");
        }
        setLoading(false);
    };

    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto w-full">
            
            {/* Header section matches standard Fruzo theme */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 flex items-center gap-2">
                        <span className="text-primary">⚡</span> Flash Clearance
                    </h1>
                    <p className="mt-1 text-gray-500 text-sm md:text-base">Prevent food waste by auto-discounting aging inventory.</p>
                </div>
                
                <button 
                    onClick={handleTriggerClearance}
                    disabled={agingProducts.length === 0 || loading}
                    className="bg-primary text-white text-sm md:text-base font-medium px-6 py-2.5 rounded-full shadow-sm hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
                >
                    {loading ? 'Processing...' : `Apply ${discountParams}% Markdown`}
                </button>
            </div>

            {/* Settings section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6 mb-6 md:mb-8">
                <h2 className="text-base md:text-lg font-semibold text-gray-700 mb-5 border-b pb-2">Control Panel</h2>
                <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                            Product Age Threshold (Days)
                        </label>
                        <input 
                            type="range" min="0" max="7" value={thresholdDays} 
                            onChange={(e) => setThresholdDays(e.target.value)}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="mt-2 text-sm font-medium text-gray-700">
                            Detecting products older than: <span className="text-primary font-bold">{thresholdDays} Days</span>
                        </div>
                    </div>
                    
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                            Markdown Discount (%)
                        </label>
                        <input 
                            type="range" min="10" max="70" step="5" value={discountParams} 
                            onChange={(e) => setDiscountParams(e.target.value)}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="mt-2 text-sm font-medium text-gray-700">
                            Will apply: <span className="text-primary font-bold">{discountParams}% OFF</span>
                        </div>
                    </div>
                </div>
            </div>

            <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 px-1">
                Products Flagged ({agingProducts.length})
            </h3>
            
            {loading ? (
                <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>
            ) : agingProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {agingProducts.map((item, idx) => {
                        const projectedPrice = Math.floor(item.price - (item.price * (discountParams / 100)));
                        
                        return (
                        <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 shadow-sm hover:shadow-md transition relative group">
                            <h4 className="font-semibold text-gray-800 text-lg pr-4">{item.name}</h4>
                            <p className="text-sm text-gray-500 mt-1">Base Price: ₹{item.price}</p>
                            
                            <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-100 flex justify-between items-center group-hover:bg-primary/5 transition">
                                <span className="text-sm font-medium text-gray-600">New Price:</span>
                                <span className="text-lg md:text-xl font-bold text-primary">₹{projectedPrice}</span>
                            </div>
                        </div>
                    )})}
                </div>
            ) : (
                <div className="text-center py-12 md:py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <span className="text-4xl opacity-80">✅</span>
                    <h3 className="mt-4 text-base md:text-lg font-medium text-gray-800">Inventory is fresh</h3>
                    <p className="text-gray-500 text-sm md:text-base mt-1">No products match the selected age threshold.</p>
                </div>
            )}
        </div>
    );
};

export default FlashClearance;