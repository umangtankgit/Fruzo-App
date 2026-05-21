import React from 'react'
import { categories } from '../assets/assets'
import { useAppContext } from '../context/AppContext'

const Categories = () => {
    const { navigate } = useAppContext();

  return (
    <div className='mt-16'>
        <p className='text-2xl sm:text-3xl font-medium'>Categories</p>
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-6 mt-6'>
            {categories.map((item, index) => (
                <div 
                    key={index} 
                    onClick={() => { navigate(`/products/${item.path.toLowerCase()}`); window.scrollTo(0,0); }} 
                    className='group cursor-pointer py-4 px-4 rounded-lg flex flex-col justify-center items-center' 
                    style={{backgroundColor: item.bgColor}}
                >
                    {/* FIXED: Strict boundaries and object-contain to prevent overflow */}
                    <img className='w-20 h-20 sm:w-24 sm:h-24 object-contain group-hover:scale-110 transition duration-300 mx-auto' src={item.image} alt={item.text} />
                    
                    <p className='text-sm sm:text-base font-medium text-center mt-3 text-gray-800'>{item.text}</p>
                </div>
            ))}
        </div>
    </div>
  )
}

export default Categories;