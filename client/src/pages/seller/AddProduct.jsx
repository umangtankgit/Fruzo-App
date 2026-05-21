import React, { useState } from 'react'
import { assets, categories } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const AddProduct = () => {

    const [files, setFiles] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [offerPrice, setOfferPrice] = useState('');
    const [quantity, setQuantity] = useState(''); 
    // ==========================================
    // NEW: Unit State for Zepto/Instamart Logic
    // ==========================================
    const [unit, setUnit] = useState('1 pc'); 
    
    const [b2bPrice, setB2bPrice] = useState("");
    const [b2bMoq, setB2bMoq] = useState(5); 
    const {axios} = useAppContext()

    const onSubmitHandler = async (event) => {
        try {
            event.preventDefault();

            const productData = {
                name,
                description: description.split('\n'),
                category,
                price: Number(price),
                offerPrice: Number(offerPrice),
                quantity: Number(quantity),
                unit, // NEW: Appended to backend payload
                b2bPrice: Number(b2bPrice), 
                b2bMoq: Number(b2bMoq)      
            };

            const formData = new FormData();
            formData.append('productData', JSON.stringify(productData));
            for (let i = 0; i < files.length; i++) {
                formData.append('images', files[i])
            }

            const {data} = await axios.post('/api/product/add', formData)

            if (data.success){
                toast.success(data.message);
                setName('');
                setDescription('')
                setCategory('')
                setPrice('')
                setOfferPrice('')
                setQuantity('') 
                setUnit('1 pc') // Reset Unit
                setFiles([])
                setB2bPrice(""); 
                setB2bMoq(5);    
            }else{
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
      }

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
            <form onSubmit={onSubmitHandler} className="md:p-10 p-4 space-y-5 max-w-lg">
                <div>
                    <p className="text-base font-medium">Product Image</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                        {Array(4).fill('').map((_, index) => (
                            <label key={index} htmlFor={`image${index}`}>
                                <input onChange={(e)=>{
                                    const updatedFiles = [...files];
                                    updatedFiles[index] = e.target.files[0]
                                    setFiles(updatedFiles)
                                }}
                                type="file" id={`image${index}`} hidden />
                                <img className="max-w-24 cursor-pointer border rounded object-cover aspect-square" src={files[index] ? URL.createObjectURL(files[index]) : assets.upload_area} alt="uploadArea" width={100} height={100} />
                            </label>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col gap-1 max-w-md">
                    <label className="text-base font-medium" htmlFor="product-name">Product Name</label>
                    <input onChange={(e)=> setName(e.target.value)} value={name}
                     id="product-name" type="text" placeholder="e.g. Alphonso Mango" className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" required />
                </div>
                <div className="flex flex-col gap-1 max-w-md">
                    <label className="text-base font-medium" htmlFor="product-description">Product Description</label>
                    <textarea onChange={(e)=> setDescription(e.target.value)} value={description}
                     id="product-description" rows={4} className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none" placeholder="Type here"></textarea>
                </div>
                <div className="w-full flex flex-col gap-1 max-w-md">
                    <label className="text-base font-medium" htmlFor="category">Category</label>
                    <select onChange={(e)=> setCategory(e.target.value)} value={category} 
                    id="category" className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" required>
                        <option value="">Select Category</option>
                        {categories.map((item, index)=>(
                            <option key={index} value={item.path}>{item.path}</option>
                        ))}
                    </select>
                </div>

                {/* PRICES, QUANTITY & UNIT */}
                <div className="flex items-center gap-4 flex-wrap max-w-md">
                    <div className="flex-1 flex flex-col gap-1 min-w-[120px]">
                        <label className="text-sm font-medium text-gray-700" htmlFor="product-price">MRP Price (₹)</label>
                        <input onChange={(e)=> setPrice(e.target.value)} value={price}
                         id="product-price" type="number" placeholder="0" className="outline-none py-2 px-3 rounded border border-gray-500/40" required />
                    </div>
                    <div className="flex-1 flex flex-col gap-1 min-w-[120px]">
                        <label className="text-sm font-medium text-gray-700" htmlFor="offer-price">Offer Price (₹)</label>
                        <input onChange={(e)=> setOfferPrice(e.target.value)} value={offerPrice} 
                        id="offer-price" type="number" placeholder="0" className="outline-none py-2 px-3 rounded border border-gray-500/40" required />
                    </div>
                    
                    {/* NEW: UNIT INPUT BOX */}
                    <div className="flex-1 flex flex-col gap-1 min-w-[120px]">
                        <label className="text-sm font-medium text-blue-600" htmlFor="unit">Unit (e.g. 500g)</label>
                        <input onChange={(e)=> setUnit(e.target.value)} value={unit} 
                        id="unit" type="text" placeholder="1 Dozen, 500g..." className="outline-none py-2 px-3 rounded border border-blue-400 bg-blue-50/30" required />
                    </div>

                    <div className="flex-1 flex flex-col gap-1 min-w-[120px]">
                        <label className="text-sm font-medium text-primary" htmlFor="quantity">Total Stock</label>
                        <input onChange={(e)=> setQuantity(e.target.value)} value={quantity} 
                        id="quantity" type="number" placeholder="e.g. 50" className="outline-none py-2 px-3 rounded border border-primary bg-primary/5" required />
                    </div>
                </div>

                {/* B2B Wholesale Inputs */}
                <div className='flex flex-col sm:flex-row gap-4 max-w-md mt-4 border-t pt-4 border-gray-200'>
                    <div className='flex flex-col gap-1 w-full'>
                        <label className="text-sm font-medium text-gray-700">Wholesale Price (₹)</label>
                        <input onChange={(e) => setB2bPrice(e.target.value)} value={b2bPrice} 
                            className='bg-slate-50 border border-gray-300 p-2 rounded outline-primary' type="number" placeholder='e.g., 80' required />
                    </div>
                    <div className='flex flex-col gap-1 w-full'>
                        <label className="text-sm font-medium text-gray-700">Min. Order Qty (MOQ)</label>
                        <input onChange={(e) => setB2bMoq(e.target.value)} value={b2bMoq} 
                            className='bg-slate-50 border border-gray-300 p-2 rounded outline-primary' type="number" placeholder='e.g., 5' required />
                    </div>
                </div>

                <button className="px-8 py-2.5 bg-primary text-white font-medium rounded cursor-pointer hover:bg-green-700 transition mt-4 w-full md:w-auto">ADD PRODUCT TO INVENTORY</button>
            </form>
        </div>
  )
}

export default AddProduct