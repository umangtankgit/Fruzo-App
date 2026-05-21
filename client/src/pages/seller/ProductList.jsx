import React, { useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { assets, categories } from '../../assets/assets'

const ProductList = () => {
    const {products, currency, axios, fetchProducts} = useAppContext()
    
    // States for the Edit Modal
    const [editingProduct, setEditingProduct] = useState(null);
    const [editFiles, setEditFiles] = useState([]);
    const [editForm, setEditForm] = useState({ 
        name: '', 
        description: '',
        category: '',
        price: '', 
        offerPrice: '', 
        unit: '1 pc',     // <-- FIXED: Added Unit State
        b2bPrice: '',
        b2bMoq: '',
        quantity: '' 
    });

    // Toggle Product Visibility/Stock Status
    const toggleStock = async (id, inStock)=>{
        try {
            const { data } = await axios.post('/api/product/stock', {id, inStock});
            if (data.success){
                fetchProducts();
                toast.success(data.message)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Delete Product
    const deleteProduct = async (id) => {
        if(!window.confirm("Are you sure you want to permanently delete this product?")) return;
        try {
            const { data } = await axios.post('/api/product/delete', { id });
            if (data.success) {
                toast.success(data.message);
                fetchProducts();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    // Open Modal and Load Data
    const openEditModal = (product) => {
        setEditingProduct(product);
        setEditFiles([]); // Clear any old file selections
        setEditForm({
            name: product.name,
            description: product.description ? product.description.join('\n') : '', // Format array for text area
            category: product.category,
            price: product.price,
            offerPrice: product.offerPrice,
            unit: product.unit || '1 pc', // <-- FIXED: Load Unit data
            b2bPrice: product.b2bPrice || '',
            b2bMoq: product.b2bMoq || 5,
            quantity: product.quantity || 0
        });
    }

    // Submit Edits to Backend
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading("Updating product details...");
        try {
            const formData = new FormData();
            formData.append('id', editingProduct._id);
            
            // Package all text fields
            formData.append('productData', JSON.stringify({
                name: editForm.name,
                description: editForm.description.split('\n'), // Convert back to array
                category: editForm.category,
                price: Number(editForm.price),
                offerPrice: Number(editForm.offerPrice),
                unit: editForm.unit,           // <-- FIXED: Sending unit to backend
                b2bPrice: Number(editForm.b2bPrice), // <-- FIXED: Wholesale payload safely packaged
                b2bMoq: Number(editForm.b2bMoq),
                quantity: Number(editForm.quantity)
            }));

            // Smart Image Logic: Tell backend which exact images to replace
            let existingImages = [...editingProduct.image];
            while(existingImages.length < 4) existingImages.push(""); 

            for (let i = 0; i < 4; i++) {
                if (editFiles[i]) {
                    formData.append('images', editFiles[i]);
                    existingImages[i] = 'NEW_FILE'; // Backend flag to replace this slot
                }
            }
            formData.append('existingImages', JSON.stringify(existingImages));

            const { data } = await axios.post('/api/product/edit', formData);
            if (data.success) {
                toast.success("Product Fully Updated!", { id: toastId });
                setEditingProduct(null);
                fetchProducts(); // Refresh list to show changes
            } else {
                toast.error(data.message, { id: toastId });
            }
        } catch (error) {
            toast.error(error.message, { id: toastId });
        }
    }

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col relative">
            <div className="w-full md:p-10 p-4">
                <h2 className="pb-4 text-2xl font-medium text-gray-800">Inventory Management</h2>
                
                <div className="flex flex-col items-center max-w-[1000px] w-full overflow-hidden rounded-md bg-white border border-gray-200 shadow-sm">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                                <tr>
                                    <th className="px-4 py-4 font-medium">Product</th>
                                    <th className="px-4 py-4 font-medium hidden sm:table-cell">Category</th>
                                    <th className="px-4 py-4 font-medium">Price</th>
                                    <th className="px-4 py-4 font-medium text-center">Qty</th>
                                    <th className="px-4 py-4 font-medium text-center">Status</th>
                                    <th className="px-4 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-gray-700">
                                {products.map((product) => (
                                    <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                        <td className="px-4 py-3 flex items-center gap-3">
                                            <div className="border border-gray-200 rounded p-1 bg-white shrink-0">
                                                <img src={product.image[0]} alt="Product" className="w-10 h-10 object-contain" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium truncate max-w-[120px] sm:max-w-xs">{product.name}</span>
                                                <span className="text-[10px] text-gray-400 font-medium">{product.unit || '1 pc'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 hidden sm:table-cell">{product.category}</td>
                                        <td className="px-4 py-3 font-medium text-primary">{currency}{product.offerPrice}</td>
                                        
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-1 rounded font-medium ${product.quantity < 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                                                {product.quantity || 0}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input onChange={()=> toggleStock(product._id, !product.inStock)} checked={product.inStock} type="checkbox" className="sr-only peer" />
                                                <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-primary transition-colors duration-200"></div>
                                                <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 peer-checked:translate-x-5"></span>
                                            </label>
                                        </td>
                                        
                                        <td className="px-4 py-3 text-right space-x-3">
                                            <button onClick={() => openEditModal(product)} className="text-blue-500 hover:text-blue-700 font-medium text-xs border border-blue-200 bg-blue-50 px-2 py-1 rounded transition">Edit</button>
                                            <button onClick={() => deleteProduct(product._id)} className="text-red-500 hover:text-red-700 font-medium text-xs border border-red-200 bg-red-50 px-2 py-1 rounded transition">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* EDIT PRODUCT MODAL */}
            {editingProduct && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        
                        <div className="flex justify-between items-center p-5 border-b border-gray-200 shrink-0">
                            <h3 className="text-lg font-semibold text-gray-800">Edit Product: {editingProduct.name}</h3>
                            <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-red-500 font-bold text-2xl leading-none">&times;</button>
                        </div>
                        
                        <div className="p-5 overflow-y-auto no-scrollbar">
                            <form id="editForm" onSubmit={handleEditSubmit} className="space-y-5">
                                
                                {/* IMAGES */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Update Images <span className="text-xs text-gray-400 font-normal">(Leave blank to keep current images)</span>
                                    </label>
                                    <div className="flex flex-wrap items-center gap-3">
                                        {Array(4).fill('').map((_, index) => (
                                            <label key={index} htmlFor={`editImage${index}`}>
                                                <input onChange={(e)=>{
                                                    const updatedFiles = [...editFiles];
                                                    updatedFiles[index] = e.target.files[0]
                                                    setEditFiles(updatedFiles)
                                                }}
                                                type="file" id={`editImage${index}`} hidden />
                                                <img 
                                                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover cursor-pointer border border-gray-300 rounded hover:border-primary transition" 
                                                    src={editFiles[index] ? URL.createObjectURL(editFiles[index]) : (editingProduct.image[index] || assets.upload_area)} 
                                                    alt="upload preview" 
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* NAME & CATEGORY */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-[2]">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                        <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 outline-primary" required />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <select value={editForm.category} onChange={(e) => setEditForm({...editForm, category: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 outline-primary" required>
                                            <option value="">Select Category</option>
                                            {categories.map((item, index)=>(
                                                <option key={index} value={item.path}>{item.path}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* DESCRIPTION */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea rows="3" value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 outline-primary resize-none" required></textarea>
                                </div>
                                
                                {/* FIXED: RETAIL PRICING, UNIT & QUANTITY IN 4-GRID */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-gray-200 pt-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">MRP Price (₹)</label>
                                        <input type="number" value={editForm.price} onChange={(e) => setEditForm({...editForm, price: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 outline-primary" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Offer Price (₹)</label>
                                        <input type="number" value={editForm.offerPrice} onChange={(e) => setEditForm({...editForm, offerPrice: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 outline-primary" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-blue-600 mb-1">Unit (e.g. 500g)</label>
                                        <input type="text" value={editForm.unit} onChange={(e) => setEditForm({...editForm, unit: e.target.value})} className="w-full border border-blue-400 bg-blue-50/30 rounded px-3 py-2 outline-primary font-medium" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-primary mb-1">Stock Qty</label>
                                        <input type="number" value={editForm.quantity} onChange={(e) => setEditForm({...editForm, quantity: e.target.value})} className="w-full border border-primary bg-primary/5 rounded px-3 py-2 outline-primary font-medium" required />
                                    </div>
                                </div>

                                {/* WHOLESALE (B2B) PRICING */}
                                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded border border-gray-200">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Wholesale Price (₹)</label>
                                        <input type="number" value={editForm.b2bPrice} onChange={(e) => setEditForm({...editForm, b2bPrice: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 outline-primary" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Wholesale MOQ</label>
                                        <input type="number" value={editForm.b2bMoq} onChange={(e) => setEditForm({...editForm, b2bMoq: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 outline-primary" required />
                                    </div>
                                </div>

                            </form>
                        </div>

                        <div className="p-5 border-t border-gray-200 bg-gray-50 flex gap-3 shrink-0 rounded-b-lg">
                            <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 border border-gray-300 bg-white text-gray-700 py-2.5 rounded hover:bg-gray-50 transition font-medium">Cancel</button>
                            <button type="submit" form="editForm" className="flex-1 bg-primary text-white py-2.5 rounded hover:bg-primary-dull transition font-medium shadow-sm">Save All Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
  )
}

export default ProductList