import React, { useState, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { useParams } from 'react-router-dom'
import { categories } from '../assets/assets'
import ProductCard from '../components/ProductCard'

const ProductCategory = () => {

    const { products } =  useAppContext()
    const { category } = useParams()
    
    // NEW: State for sorting
    const [sortType, setSortType] = useState('relevant')
    const [filteredProducts, setFilteredProducts] = useState([])

    const searchCategory = categories.find((item)=> item.path.toLowerCase() === category)

    useEffect(() => {
        // 1. Filter by the URL category and make sure it is in stock
        let productsCopy = products.filter((product) => 
            product.category.toLowerCase() === category && product.inStock
        );

        // 2. Apply Sorting
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

        setFilteredProducts(productsCopy);
    }, [products, category, sortType]);

  return (
    <div className='mt-16 pb-16'>
      
      {/* Header and Sorting Container */}
      <div className='flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-6'>
          {searchCategory && (
            <div className='flex flex-col items-start w-max'>
                <p className='text-2xl font-medium'>{searchCategory.text.toUpperCase()}</p>
                <div className="w-16 h-0.5 bg-primary rounded-full mt-1"></div>
            </div>
          )}

          {/* Sorting Dropdown */}
          <select onChange={(e) => setSortType(e.target.value)} className="border border-gray-300 text-sm px-3 py-2 rounded outline-none cursor-pointer max-w-max">
              <option value="relevant">Sort by: Relevant</option>
              <option value="low-high">Sort by: Price (Low to High)</option>
              <option value="high-low">Sort by: Price (High to Low)</option>
              <option value="rating">Sort by: Top Rated</option>
          </select>
      </div>

      {filteredProducts.length > 0 ? (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6'>
            {filteredProducts.map((product)=>(
                <ProductCard key={product._id} product={product}/>
            ))}
        </div>
      ): (
        <div className='flex items-center justify-center h-[60vh]'>
            <p className='text-2xl font-medium text-primary'>No products found in this category.</p>
        </div>
      )}
    </div>
  )
}

export default ProductCategory