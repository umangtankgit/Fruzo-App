import React, { useEffect, useState, useRef } from 'react'
import { useAppContext } from '../context/AppContext'
import ProductCard from '../components/ProductCard'

const AllProducts = () => {

    const { products, searchQuery } = useAppContext()
    const [filteredProducts, setFilteredProducts] = useState([])
    
    // States for Filters and Sorting
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [sortType, setSortType] = useState('relevant');

    const dropdownRef = useRef(null);

    // Extract all unique categories dynamically
    const allCategories = [...new Set(products.map(item => item.category))];

    // Handle Checkbox clicks
    const toggleCategory = (e) => {
        const value = e.target.value;
        if (selectedCategories.includes(value)) {
            setSelectedCategories(prev => prev.filter(item => item !== value));
        } else {
            setSelectedCategories(prev => [...prev, value]);
        }
    };

    // Close the dropdown if the user clicks anywhere outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowCategoryDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(()=>{
        let productsCopy = products.slice();

        // 1. Apply Search Query
        if(searchQuery.length > 0){
            productsCopy = productsCopy.filter(
                product => product.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // 2. Apply Category Checkboxes
        if (selectedCategories.length > 0) {
            productsCopy = productsCopy.filter(product => selectedCategories.includes(product.category));
        }

        // 3. Apply Sorting
        switch (sortType) {
            case 'low-high':
                productsCopy.sort((a, b) => a.offerPrice - b.offerPrice);
                break;
            case 'high-low':
                productsCopy.sort((a, b) => b.offerPrice - a.offerPrice);
                break;
            case 'rating':
                productsCopy.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
                break;
            default:
                break;
        }

        setFilteredProducts(productsCopy)

    }, [products, searchQuery, selectedCategories, sortType])

  return (
    <div className='mt-16 w-full'>
        
        {/* ========================================== */}
        {/* HEADER AND DROPDOWNS                       */}
        {/* ========================================== */}
        <div className='flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 w-full'>
            
            {/* EXACT ORIGINAL HEADER */}
            <div className='flex flex-col items-end w-max'>
                <p className='text-xl sm:text-2xl font-medium uppercase'>All products</p>
                <div className='w-16 h-0.5 bg-primary rounded-full mt-1'></div>
            </div>

            {/* Buttons aligned to the right */}
            <div className='flex flex-wrap items-center gap-3 relative' ref={dropdownRef}>
                
                {/* 1. Custom Category Filter Dropdown */}
                <div className="relative">
                    <button 
                        onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                        className="flex items-center gap-2 border border-gray-300 text-sm px-4 py-2 rounded outline-none cursor-pointer bg-white text-gray-700 hover:bg-gray-50 transition"
                    >
                        Filter by Category
                        {selectedCategories.length > 0 && (
                            <span className="bg-primary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full ml-1">
                                {selectedCategories.length}
                            </span>
                        )}
                        <span className={`text-[10px] ml-1 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`}>▼</span>
                    </button>

                    {/* Floating Menu */}
                    {showCategoryDropdown && (
                        <div className="absolute right-0 sm:left-0 top-full mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded z-20 p-4">
                            <div className="flex flex-col gap-3 text-sm text-gray-700">
                                {allCategories.map((cat, index) => (
                                    <label key={index} className="flex gap-3 items-center cursor-pointer hover:text-primary transition">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 accent-primary cursor-pointer" 
                                            value={cat} 
                                            onChange={toggleCategory}
                                            checked={selectedCategories.includes(cat)}
                                        /> 
                                        {cat}
                                    </label>
                                ))}
                            </div>
                            
                            {selectedCategories.length > 0 && (
                                <button 
                                    onClick={() => setSelectedCategories([])} 
                                    className="w-full mt-4 text-xs text-red-500 hover:text-red-600 underline text-left"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* 2. Sorting Dropdown */}
                <select onChange={(e) => setSortType(e.target.value)} className="border border-gray-300 text-sm px-3 py-2 rounded outline-primary cursor-pointer bg-white text-gray-700">
                    <option value="relevant">Sort by: Relevant</option>
                    <option value="low-high">Price: Low to High</option>
                    <option value="high-low">Price: High to Low</option>
                    <option value="rating">Top Rated ⭐</option>
                </select>
                
            </div>
        </div>

        {/* ========================================== */}
        {/* EXACT ORIGINAL GRID                        */}
        {/* ========================================== */}
        {filteredProducts.length > 0 ? (
            <div className='w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6'>
                {filteredProducts.filter((product)=> product.inStock).map((product, index)=>(
                    <ProductCard key={index} product={product}/>
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <p className="text-xl font-medium mb-2">No products found</p>
            </div>
        )}

    </div>
  )
}

export default AllProducts;