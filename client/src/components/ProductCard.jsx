import React from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const ProductCard = ({product}) => {
    const {currency, addToCart, removeFromCart, cartItems, navigate} = useAppContext();

    return product && (
        <div 
            onClick={()=> {navigate(`/products/${product.category.toLowerCase()}/${product._id}`); window.scrollTo(0,0);}} 
            className="group cursor-pointer border border-gray-200 rounded-lg p-2 sm:p-4 bg-white flex flex-col h-full hover:shadow-md transition-shadow relative"
        >
            {/* Image Container */}
            <div className="w-full aspect-[4/3] sm:aspect-square flex items-center justify-center overflow-hidden mb-3">
                <img className="group-hover:scale-105 transition-transform duration-300 w-full h-full object-contain" src={product.image[0]} alt={product.name} />
            </div>
            
            {/* Content Container */}
            <div className="flex flex-col flex-1 min-w-0">
                <p className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-wide">{product.category}</p>
                <h3 className="text-gray-800 font-medium text-sm sm:text-base truncate mt-0.5 leading-tight">{product.name}</h3>
                
                {/* ========================================== */}
                {/* NEW: ZEPTO/BLINKIT STYLE UNIT BADGE        */}
                {/* ========================================== */}
                <div className="mt-1">
                    <span className="text-gray-500 text-[10px] sm:text-xs font-medium bg-gray-100 border border-gray-200 px-2 py-0.5 rounded">
                        {product.unit || "1 pc"}
                    </span>
                </div>
                
                {/* DYNAMIC STARS LOGIC */}
                <div className="flex items-center gap-1 mt-2">
                    {Array(5).fill('').map((_, i) => (
                        <img 
                            key={i} 
                            className="w-3 sm:w-3.5" 
                            src={i < Math.round(product.averageRating || 0) ? assets.star_icon : assets.star_dull_icon} 
                            alt="star"
                        />
                    ))}
                    <span className="text-[10px] sm:text-xs text-gray-400 ml-1">({product.numReviews || 0})</span>
                </div>

                {/* SMART FOMO BADGE */}
                {product.quantity > 0 && product.quantity < 10 && (
                    <div className="mt-2">
                        <span className="text-[10px] sm:text-xs text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded font-medium">
                            🔥 Few Left, Order Now!
                        </span>
                    </div>
                )}
                
                {/* Price and Add to Cart Section */}
                <div className="flex items-center justify-between mt-auto pt-3">
                    <div className="flex flex-col">
                        <span className="text-sm sm:text-lg font-bold text-primary leading-none">
                            {currency}{product.offerPrice}
                        </span>
                        <span className="text-[10px] sm:text-xs text-gray-400 line-through mt-0.5">
                            {currency}{product.price}
                        </span>
                    </div>

                    <div onClick={(e) => { e.stopPropagation(); }}>
                        {!cartItems[product._id] ? (
                            <button className="flex items-center justify-center gap-1 bg-primary/10 border border-primary/30 text-primary px-2 sm:px-3 py-1 sm:py-1.5 rounded-md hover:bg-primary/20 transition-colors text-xs sm:text-sm font-medium" onClick={() => addToCart(product._id)} >
                                <img src={assets.cart_icon} alt="cart_icon" className="w-3.5 sm:w-4" />
                                Add
                            </button>
                        ) : (
                            <div className="flex items-center justify-between bg-primary/10 border border-primary/30 rounded-md text-primary text-xs sm:text-sm w-[60px] sm:w-[72px] h-[28px] sm:h-[34px]">
                                <button onClick={() => {removeFromCart(product._id)}} className="w-1/3 h-full flex items-center justify-center font-bold hover:bg-primary/20 rounded-l-md">-</button>
                                <span className="w-1/3 text-center font-medium">{cartItems[product._id]}</span>
                                <button onClick={() => {addToCart(product._id)}} className="w-1/3 h-full flex items-center justify-center font-bold hover:bg-primary/20 rounded-r-md">+</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;