import React from 'react';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';

const Wishlist = () => {
    const { products, wishlistItems, navigate } = useAppContext();

    // Sirf un products ko filter karo jo wishlist mein hain
    const wishlistedProducts = products.filter(product => wishlistItems?.includes(product._id));

    return (
        <div className="w-full px-4 md:px-8 py-8 min-h-[60vh] mt-16 max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">My Wishlist ❤️</h2>
                <span className="bg-red-50 text-red-600 border border-red-100 px-3 py-1 rounded-full text-sm font-bold tracking-wide">
                    {wishlistedProducts.length} Items
                </span>
            </div>

            {wishlistedProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                    {wishlistedProducts.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50/50 rounded-2xl border border-gray-100 border-dashed">
                    <div className="text-6xl mb-4 opacity-80">💔</div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">Your Wishlist is Empty!</h3>
                    <p className="text-gray-500 mb-6 max-w-md text-sm">Looks like you haven't added any items to your wishlist yet. Let's find some favorites!</p>
                    <button 
                        onClick={() => {navigate('/products'); window.scrollTo(0,0);}}
                        className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-sm hover:shadow-md cursor-pointer"
                    >
                        Explore Products
                    </button>
                </div>
            )}
        </div>
    );
};

export default Wishlist;