import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StoreStatusBanner = () => {
    const [isStoreOpen, setIsStoreOpen] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                // Adjust port if your backend runs differently
                const { data } = await axios.get('http://localhost:4000/api/settings/status');
                if (data.success) {
                    setIsStoreOpen(data.isStoreOpen);
                    // Save to local storage so Cart.jsx can instantly read it
                    localStorage.setItem('fruzo_store_status', data.isStoreOpen);
                    // Dispatch event so other components know it changed
                    window.dispatchEvent(new Event('storage'));
                }
            } catch (error) {
                console.error("Failed to fetch store status");
            }
        };
        
        fetchStatus();
        // Check every 30 seconds for live updates
        const interval = setInterval(fetchStatus, 30000); 
        return () => clearInterval(interval);
    }, []);

    if (isStoreOpen) return null;

    return (
        <div className="bg-red-50 border-b border-red-200 text-red-600 px-4 py-2.5 text-center text-sm md:text-base font-medium flex items-center justify-center gap-2 z-50 relative w-full shadow-sm transition-all duration-500">
            <span className="text-lg">⚠️</span>
            Jaiswal Fruits is currently closed. You can browse and add items, but checkout is temporarily disabled.
        </div>
    );
};

export default StoreStatusBanner;