import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const BulkPricing = () => {
    const { currency, axios } = useAppContext()
    
    // States to manage original data and live edits
    const [originalProducts, setOriginalProducts] = useState([])
    const [editedProducts, setEditedProducts] = useState({})
    const [isSaving, setIsSaving] = useState(false)

    // Fetch all products on load
    const fetchProducts = async () => {
        try {
            const { data } = await axios.get('/api/product/list');
            if (data.success) {
                setOriginalProducts(data.products)
                
                // Initialize the editable state
                const editableState = {};
                data.products.forEach(p => {
                    editableState[p._id] = {
                        offerPrice: p.offerPrice || 0,
                        b2bPrice: p.b2bPrice || 0,
                        b2bMoq: p.b2bMoq || 5,
                        quantity: p.quantity || 0,
                        isModified: false // Tracking changes
                    }
                });
                setEditedProducts(editableState);
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [])

    // Handle typing in the input boxes
    const handleInputChange = (productId, field, value) => {
        setEditedProducts(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                [field]: value,
                isModified: true // Mark this specific product as changed
            }
        }));
    }

    // Save only the modified items to the backend
    const handleBulkSave = async () => {
        const updates = Object.keys(editedProducts)
            .filter(id => editedProducts[id].isModified)
            .map(id => ({
                _id: id,
                offerPrice: editedProducts[id].offerPrice,
                b2bPrice: editedProducts[id].b2bPrice,
                b2bMoq: editedProducts[id].b2bMoq,
                quantity: editedProducts[id].quantity
            }));

        if (updates.length === 0) {
            return toast.error("No changes detected. Please modify prices/stock first.");
        }

        if (!window.confirm(`You are about to update prices/stock for ${updates.length} items. Proceed?`)) {
            return;
        }

        setIsSaving(true);
        const toastId = toast.loading("Syncing with Mandi Rates...");

        try {
            const { data } = await axios.post('/api/product/bulk-edit', { updates });
            if (data.success) {
                toast.success(data.message, { id: toastId });
                fetchProducts(); 
            } else {
                toast.error(data.message, { id: toastId });
            }
        } catch (error) {
            toast.error(error.message, { id: toastId });
        } finally {
            setIsSaving(false);
        }
    }

    const modifiedCount = Object.values(editedProducts).filter(p => p.isModified).length;

    return (
        <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col relative bg-gray-50">
            
            {/* STICKY HEADER */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 md:px-10 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">Mandi Rates (Bulk Edit)</h2>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Update daily prices and stock instantly like a spreadsheet.</p>
                </div>
                
                <button 
                    onClick={handleBulkSave}
                    disabled={isSaving || modifiedCount === 0}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition shadow-sm
                        ${modifiedCount > 0 
                            ? 'bg-primary text-white hover:bg-primary-dull cursor-pointer' 
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                    `}
                >
                    {isSaving ? "Saving..." : `Save All Changes (${modifiedCount})`}
                </button>
            </div>

            {/* THE EXCEL-LIKE GRID */}
            <div className="px-4 md:px-10 py-6">
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider font-bold">
                                <tr>
                                    <th className="px-5 py-4 w-1/3">Product Name</th>
                                    <th className="px-5 py-4 text-center">Retail Offer Price (₹)</th>
                                    <th className="px-5 py-4 text-center">Wholesale Price (₹)</th>
                                    <th className="px-5 py-4 text-center">Wholesale MOQ</th>
                                    <th className="px-5 py-4 text-center">Total Stock Qty</th>
                                </tr>
                            </thead>
                            
                            <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                                {originalProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-10 text-gray-500 font-medium">
                                            No products found in inventory.
                                        </td>
                                    </tr>
                                ) : null}

                                {originalProducts.map((product) => {
                                    const editState = editedProducts[product._id];
                                    if (!editState) return null;

                                    return (
                                        <tr key={product._id} className={`transition-colors ${editState.isModified ? 'bg-yellow-50/50' : 'hover:bg-gray-50'}`}>
                                            
                                            {/* Product Info */}
                                            <td className="px-5 py-3 flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white border border-gray-200 rounded flex items-center justify-center p-1 shrink-0">
                                                    {/* FIXED: Optional Chaining added to prevent crashes */}
                                                    <img src={product?.image?.[0] || ''} alt="product" className="w-full h-full object-contain" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-800">{product?.name || 'Unknown Item'}</span>
                                                    <span className="text-[10px] text-gray-500 font-medium">{product?.unit || '1 pc'} • {product?.category || 'General'}</span>
                                                </div>
                                                {editState.isModified && (
                                                    <span className="ml-auto bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded border border-yellow-200 hidden md:block">
                                                        MODIFIED
                                                    </span>
                                                )}
                                            </td>

                                            {/* Retail Price Input */}
                                            <td className="px-5 py-3">
                                                <div className="relative flex items-center justify-center">
                                                    <span className="absolute left-4 text-gray-400 font-medium">{currency}</span>
                                                    <input 
                                                        type="number" 
                                                        value={editState.offerPrice}
                                                        onChange={(e) => handleInputChange(product._id, 'offerPrice', e.target.value)}
                                                        className={`w-28 pl-8 pr-3 py-1.5 rounded-md border outline-none font-bold text-center transition
                                                            ${editState.offerPrice !== (product.offerPrice || 0) ? 'border-primary bg-primary/5 text-primary' : 'border-gray-300 bg-white text-gray-700 focus:border-gray-400'}
                                                        `}
                                                    />
                                                </div>
                                            </td>

                                            {/* Wholesale Price Input */}
                                            <td className="px-5 py-3">
                                                <div className="relative flex items-center justify-center">
                                                    <span className="absolute left-4 text-gray-400 font-medium">{currency}</span>
                                                    <input 
                                                        type="number" 
                                                        value={editState.b2bPrice}
                                                        onChange={(e) => handleInputChange(product._id, 'b2bPrice', e.target.value)}
                                                        className={`w-28 pl-8 pr-3 py-1.5 rounded-md border outline-none font-bold text-center transition
                                                            ${editState.b2bPrice !== (product.b2bPrice || 0) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white text-gray-700 focus:border-gray-400'}
                                                        `}
                                                    />
                                                </div>
                                            </td>

                                            {/* Wholesale MOQ Input */}
                                            <td className="px-5 py-3 text-center">
                                                <input 
                                                    type="number" 
                                                    value={editState.b2bMoq}
                                                    onChange={(e) => handleInputChange(product._id, 'b2bMoq', e.target.value)}
                                                    className="w-20 px-2 py-1.5 rounded-md border border-gray-300 outline-none font-bold text-center bg-white text-gray-700 focus:border-gray-400"
                                                />
                                            </td>

                                            {/* Total Stock Input */}
                                            <td className="px-5 py-3 text-center">
                                                <input 
                                                    type="number" 
                                                    value={editState.quantity}
                                                    onChange={(e) => handleInputChange(product._id, 'quantity', e.target.value)}
                                                    className={`w-24 px-3 py-1.5 rounded-md border outline-none font-black text-center transition
                                                        ${editState.quantity !== (product.quantity || 0) ? 'border-primary bg-primary/10 text-primary' : 'border-gray-300 bg-gray-50 text-gray-800'}
                                                        ${editState.quantity == 0 ? 'text-red-500 border-red-300 bg-red-50' : ''}
                                                    `}
                                                />
                                            </td>

                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BulkPricing