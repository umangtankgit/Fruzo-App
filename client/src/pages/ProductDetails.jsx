import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Link, useParams } from "react-router-dom";
import { assets } from "../assets/assets"; 
import ProductCard from "../components/ProductCard";

const ProductDetails = () => {

    const {products, navigate, currency, addToCart} = useAppContext()
    const {id} = useParams()
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [thumbnail, setThumbnail] = useState(null);

    const product = products.find((item)=> item._id === id);

    useEffect(()=>{
        if(products.length > 0 && product){
            let productsCopy = products.slice();
            productsCopy = productsCopy.filter((item)=> product.category === item.category && item._id !== product._id)
            setRelatedProducts(productsCopy.slice(0,5))
        }
    },[products, product])

    useEffect(()=>{
        setThumbnail(product?.image?.[0] ? product.image[0] : null)
    },[product])

    return product && (
        <div className="mt-12 mb-20 px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
            <p className="text-sm text-gray-500">
                <Link to={"/"} className="hover:text-primary">Home</Link> /
                <Link to={"/products"} className="hover:text-primary"> Products</Link> /
                <Link to={`/products/${product.category.toLowerCase()}`} className="hover:text-primary"> {product.category}</Link> /
                <span className="text-primary font-medium"> {product.name}</span>
            </p>

            <div className="flex flex-col md:flex-row gap-10 lg:gap-16 mt-8">
                <div className="flex gap-3 md:w-1/2">
                    <div className="flex flex-col gap-3 w-[15%] sm:w-[18%]">
                        {product.image?.map((image, index) => (
                            <div key={index} onClick={() => setThumbnail(image)} className="border border-gray-200 rounded overflow-hidden cursor-pointer hover:border-primary transition" >
                                <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>

                    <div className="border border-gray-200 rounded overflow-hidden w-[85%] sm:w-[82%] flex items-center justify-center bg-gray-50">
                        <img src={thumbnail} alt="Selected product" className="w-full h-full object-contain max-h-[500px]" />
                    </div>
                </div>

                <div className="text-sm w-full md:w-1/2 flex flex-col">
                    <h1 className="text-2xl sm:text-3xl font-medium text-gray-800">{product.name}</h1>

                    <div className="flex items-center gap-1 mt-2">
                        {Array(5).fill('').map((_, i) => (
                          <img 
                            key={i} 
                            src={i < Math.round(product.averageRating || 0) ? assets.star_icon : assets.star_dull_icon} 
                            alt="star" 
                            className="w-4 sm:w-4.5"
                          />
                        ))}
                        <p className="text-sm text-gray-500 ml-2">({product.numReviews || 0} Reviews)</p>
                    </div>

                    <div className="mt-6 flex flex-col gap-1">
                        <p className="text-gray-400 line-through text-base">MRP: {currency}{product.price}</p>
                        <div className="flex items-end gap-3">
                            <p className="text-3xl sm:text-4xl font-bold text-primary">{currency}{product.offerPrice}</p>
                            <span className="text-sm text-gray-500 mb-1">(inclusive of all taxes)</span>
                        </div>
                    </div>

                    {/* FIXED: Reverted to product.quantity */}
                    {product.quantity > 0 && product.quantity < 10 && (
                        <div className="mt-5 inline-block bg-red-50 border border-red-200 rounded-md px-4 py-2 w-max">
                            <p className="text-sm text-red-600 font-medium flex items-center gap-2">
                                🔥 Selling fast! Only {product.quantity} left in stock.
                            </p>
                        </div>
                    )}

                    <div className="mt-8">
                        <p className="text-base font-medium text-gray-800 border-b border-gray-200 pb-2 mb-3">About Product</p>
                        <div className="text-gray-600 text-sm leading-relaxed">
                            {Array.isArray(product.description) ? (
                                <ul className="list-disc ml-5 space-y-2">
                                    {product.description.map((desc, index) => (
                                        <li key={index}>{desc}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>{product.description}</p>
                            )}
                        </div>
                    </div>

                    {/* FIXED: Reverted to product.quantity */}
                    {product.quantity > 0 ? (
                        <div className="flex items-center mt-10 gap-4 text-base">
                            <button onClick={()=> addToCart(product._id)} className="w-1/2 py-3.5 rounded-md cursor-pointer font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition shadow-sm" >
                                Add to Cart
                            </button>
                            <button onClick={()=> {addToCart(product._id); navigate("/cart")}} className="w-1/2 py-3.5 rounded-md cursor-pointer font-medium bg-primary text-white hover:bg-primary-dull transition shadow-sm" >
                                Buy now
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center mt-10 gap-4 text-base">
                            <button disabled className="w-full py-3.5 rounded-md cursor-not-allowed font-medium bg-gray-400 text-white transition shadow-sm" >
                                Out of Stock
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Reviews Section */}
            <div className="mt-20 border-t border-gray-200 pt-10">
                <h2 className="text-2xl font-medium text-gray-800 mb-6">Customer Reviews</h2>
                <div className="flex flex-col gap-4">
                    {product.reviews && product.reviews.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {product.reviews.map((rev, index) => (
                                <div key={index} className="bg-gray-50 p-5 rounded-md border border-gray-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                                {rev.name.charAt(0).toUpperCase()}
                                            </div>
                                            <p className="font-medium text-gray-800">{rev.name}</p>
                                        </div>
                                        <div className="flex">
                                            {Array(5).fill('').map((_, i) => (
                                                <img key={i} src={i < rev.rating ? assets.star_icon : assets.star_dull_icon} alt="star" className="w-3.5" />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed">{rev.comment}</p>
                                    <p className="text-xs text-gray-400 mt-3 font-medium">Reviewed on {new Date(rev.createdAt).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-md p-10 text-center">
                            <p className="text-gray-500 font-medium text-lg">No reviews yet.</p>
                            <p className="text-gray-400 text-sm mt-1">When customers purchase and review this item, it will appear here.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col items-center mt-24">
                <div className="flex flex-col items-center w-max mb-8">
                    <p className="text-2xl sm:text-3xl font-medium text-gray-800">Related Products</p>
                    <div className="w-16 h-1 bg-primary rounded-full mt-2"></div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6 w-full">
                    {/* FIXED: Reverted to product.quantity */}
                    {relatedProducts.filter((product) => product.quantity > 0).map((product, index)=>(
                        <ProductCard key={index} product={product}/>
                    ))}
                </div>
                <button onClick={()=> {navigate('/products'); window.scrollTo(0,0)}} className="mt-12 cursor-pointer px-10 py-3 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition font-medium">
                    View All Products
                </button>
            </div>
        </div>
    );
};

export default ProductDetails;