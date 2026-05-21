import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Coupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [code, setCode] = useState('');
    const [discountType, setDiscountType] = useState('flat');
    const [discountValue, setDiscountValue] = useState('');
    const [minCartValue, setMinCartValue] = useState('');

    // Fetch all coupons from database
    const fetchCoupons = async () => {
        try {
            const { data } = await axios.get('/api/coupon/list');
            if (data.success) {
                setCoupons(data.coupons);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    // Create a new coupon
    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('/api/coupon/create', {
                code,
                discountType,
                discountValue: Number(discountValue),
                minCartValue: Number(minCartValue)
            });

            if (data.success) {
                toast.success(data.message);
                setCode('');
                setDiscountValue('');
                setMinCartValue('');
                fetchCoupons(); // Refresh list after adding
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Delete a coupon
    const deleteCoupon = async (id) => {
        try {
            const { data } = await axios.post('/api/coupon/delete', { id });
            if (data.success) {
                toast.success(data.message);
                fetchCoupons(); // Refresh list after deleting
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="w-full sm:px-10 px-4 py-8">
            <h2 className="text-2xl font-medium text-gray-800 mb-8">Coupon Management</h2>

            {/* Create Coupon Form */}
            <form onSubmit={onSubmitHandler} className="bg-white p-6 border border-gray-200 rounded-md shadow-sm mb-10 max-w-3xl">
                <h3 className="text-lg font-medium mb-4 text-gray-700">Create New Coupon</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Coupon Code (e.g. FRUZO10)</label>
                        <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required className="w-full px-3 py-2 border border-gray-300 rounded outline-primary uppercase" placeholder="Enter Code" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Discount Type</label>
                        <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded outline-primary bg-white">
                            <option value="flat">Flat Amount (₹)</option>
                            <option value="percent">Percentage (%)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Discount Value</label>
                        <input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} required min="1" className="w-full px-3 py-2 border border-gray-300 rounded outline-primary" placeholder={discountType === 'flat' ? "e.g. 50" : "e.g. 10"} />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Minimum Cart Value (₹)</label>
                        <input type="number" value={minCartValue} onChange={(e) => setMinCartValue(e.target.value)} required min="0" className="w-full px-3 py-2 border border-gray-300 rounded outline-primary" placeholder="e.g. 500" />
                    </div>
                </div>
                <button type="submit" className="mt-5 bg-primary text-white px-8 py-2.5 rounded-md hover:bg-green-700 transition">
                    Create Coupon
                </button>
            </form>

            {/* Active Coupons Table */}
            <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-x-auto">
                <table className="w-full text-left text-gray-600 text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
                        <tr>
                            <th className="px-6 py-4 font-medium">Coupon Code</th>
                            <th className="px-6 py-4 font-medium">Discount</th>
                            <th className="px-6 py-4 font-medium">Min. Order</th>
                            <th className="px-6 py-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.length > 0 ? (
                            coupons.map((coupon, index) => (
                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="px-6 py-4 font-semibold text-primary">{coupon.code}</td>
                                    <td className="px-6 py-4">
                                        {coupon.discountType === 'flat' ? `₹${coupon.discountValue} Off` : `${coupon.discountValue}% Off`}
                                    </td>
                                    <td className="px-6 py-4">₹{coupon.minCartValue}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => deleteCoupon(coupon._id)} className="text-red-500 border border-red-200 bg-red-50 px-3 py-1 rounded hover:bg-red-500 hover:text-white transition">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-gray-400">No active coupons found. Create one above!</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Coupons;