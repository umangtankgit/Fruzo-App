import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

export const AppContextProvider = ({children})=>{

    const currency = import.meta.env.VITE_CURRENCY;

    const navigate = useNavigate();
    const [user, setUser] = useState(null)
    const [isSeller, setIsSeller] = useState(false)
    const [showUserLogin, setShowUserLogin] = useState(false)
    const [products, setProducts] = useState([])

    const [cartItems, setCartItems] = useState({})
    const [searchQuery, setSearchQuery] = useState({})
    
    // NEW: Wishlist State
    const [wishlistItems, setWishlistItems] = useState([])

  const fetchSeller = async ()=>{
    try {
        const {data} = await axios.get('/api/seller/is-auth');
        if(data.success){
            setIsSeller(true)
        }else{
            setIsSeller(false)
        }
    } catch (error) {
        setIsSeller(false)
    }
  }

const fetchUser = async ()=>{
    try {
        const {data} = await axios.get('api/user/is-auth');
        if (data.success){
            setUser(data.user)
            setCartItems(data.user.cartItems || {})
            // NEW: Set initial wishlist from database
            setWishlistItems(data.user.wishlist || [])
        }
    } catch (error) {
        setUser(null)
    }
}

    const fetchProducts = async ()=>{
        try {
            const { data } = await axios.get('/api/product/list')
            if(data.success){
                setProducts(data.products)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

// ==========================================
// NEW: TOGGLE WISHLIST LOGIC
// ==========================================
const toggleWishlist = async (itemId) => {
    if (!user) {
        toast.error("Please login to add to wishlist ❤️");
        setShowUserLogin(true);
        return;
    }

    let newWishlist = [...wishlistItems];
    if (newWishlist.includes(itemId)) {
        newWishlist = newWishlist.filter(id => id !== itemId);
        toast.success("Removed from Wishlist");
    } else {
        newWishlist.push(itemId);
        toast.success("Added to Wishlist ❤️");
    }
    
    // Optimistic UI Update (Turant red ho jayega)
    setWishlistItems(newWishlist);

    // Backend Sync
    try {
        await axios.post('/api/user/update-wishlist', { wishlist: newWishlist });
    } catch (error) {
        console.error("Wishlist sync error", error);
    }
}

const addToCart = (itemId) => {
    const MAX_LIMIT = 30; 

    const product = products.find((p) => p._id === itemId);
    if (!product) {
        toast.error("Product not found");
        return;
    }

    let cartData = structuredClone(cartItems);
    let currentQty = cartData[itemId] || 0;
    let newQty = currentQty + 1;

    if (newQty > MAX_LIMIT) {
        toast.error(`You cannot add more than ${MAX_LIMIT} units per order.`);
        return; 
    }

    if (newQty > product.quantity) {
        toast.error(`Maximum quantity reached! Only ${product.quantity} left in stock.`);
        return; 
    }

    cartData[itemId] = newQty;
    setCartItems(cartData);
    toast.success("Added to Cart")
}

  const updateCartItem = (itemId, quantity)=>{
    const MAX_LIMIT = 30; 

    const product = products.find((p) => p._id === itemId);
    if (!product) return;

    if (quantity > MAX_LIMIT) {
        toast.error(`You cannot order more than ${MAX_LIMIT} units.`);
        return;
    }

    if (quantity > product.quantity) {
        toast.error(`Only ${product.quantity} units available in stock.`);
        return;
    }

    let cartData = structuredClone(cartItems);
    cartData[itemId] = quantity;
    setCartItems(cartData)
    toast.success("Cart Updated")
  }

const removeFromCart = (itemId)=>{
    let cartData = structuredClone(cartItems);
    if(cartData[itemId]){
        cartData[itemId] -= 1;
        if(cartData[itemId] === 0){
            delete cartData[itemId];
        }
    }
    toast.success("Removed from Cart")
    setCartItems(cartData)
}

  const getCartCount = ()=>{
    let totalCount = 0;
    for(const item in cartItems){
        totalCount += cartItems[item];
    }
    return totalCount;
  }

const getCartAmount = () => {
    let totalAmount = 0;
    
    for (const item in cartItems) {
      let itemInfo = products.find((product) => product._id === item);
      if (itemInfo && cartItems[item] > 0) {
        if (cartItems[item] >= itemInfo.b2bMoq) {
          totalAmount += itemInfo.b2bPrice * cartItems[item];
        } else {
          totalAmount += itemInfo.offerPrice * cartItems[item];
        }
      }
    }
    return Math.floor(totalAmount * 100) / 100;
  };

    useEffect(()=>{
        fetchUser()
        fetchSeller()
        fetchProducts()
    },[])

    useEffect(()=>{
        const updateCart = async ()=>{
            try {
                const { data } = await axios.post('/api/cart/update', {cartItems})
                if (!data.success){
                    toast.error(data.message)
                }
            } catch (error) {
                toast.error(error.message)
            }
        }

        if(user){
            updateCart()
        }
    },[cartItems])

    // Added wishlistItems and toggleWishlist to Context Value
    const value = {navigate, user, setUser, setIsSeller, isSeller,
        showUserLogin, setShowUserLogin, products, currency, addToCart, updateCartItem, removeFromCart, cartItems, searchQuery, setSearchQuery, getCartAmount, getCartCount, axios, fetchProducts, setCartItems,
        wishlistItems, toggleWishlist
    }

    return <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
}

export const useAppContext = ()=>{
    return useContext(AppContext)
}