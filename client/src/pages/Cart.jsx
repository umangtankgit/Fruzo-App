import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";

const MIN_ORDER_AMOUNT = 500; // ✅ Minimum order amount

const Cart = () => {
    const {products, currency, cartItems, removeFromCart, addToCart, getCartCount, updateCartItem, navigate, getCartAmount, axios, user, setCartItems} = useAppContext()
    const [cartArray, setCartArray] = useState([])
    const [addresses, setAddresses] = useState([])
    const [showAddress, setShowAddress] = useState(false)
    const [selectedAddress, setSelectedAddress] = useState(null)
    const [paymentOption, setPaymentOption] = useState("COD")

    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [isApplying, setIsApplying] = useState(false);
    
    // 🚀 Store Status State
    const [isStoreOpen, setIsStoreOpen] = useState(true);

    const [deliveryHours, setDeliveryHours] = useState("3"); 
    const expressFee = parseInt(deliveryHours) <= 2 ? 150 : 0; 

    // ✅ Check if cart meets minimum order amount
    const cartSubtotal = getCartAmount();
    const isMinOrderMet = cartSubtotal >= MIN_ORDER_AMOUNT;
    const amountNeeded = MIN_ORDER_AMOUNT - cartSubtotal;

    // Listen to local storage for instant status changes
    useEffect(() => {
        const checkStatus = () => {
            const status = localStorage.getItem('fruzo_store_status');
            setIsStoreOpen(status !== 'false');
        };
        checkStatus();
        window.addEventListener('storage', checkStatus);
        return () => window.removeEventListener('storage', checkStatus);
    }, []);

    const getCart = ()=>{
        let tempArray = []
        for(const key in cartItems){
            if (cartItems[key] > 0) {
                const product = products.find((item)=>item._id === key)
                if(product) {
                    tempArray.push(product)
                }
            }
        }
        setCartArray(tempArray)
    }

    const getUserAddress = async ()=>{
        try {
            const {data} = await axios.get('/api/address/get');
            if (data.success){
                const safeAddresses = data.addresses || [];
                setAddresses(safeAddresses);
                if(safeAddresses.length > 0){
                    const userDefaultId = user?.defaultAddress?._id || user?.defaultAddress;
                    const preferredAddress = safeAddresses.find(addr => addr._id === userDefaultId);
                    setSelectedAddress(preferredAddress || safeAddresses[0])
                }
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return toast.error("Please enter a valid coupon code");
        setIsApplying(true);
        try {
            const currentSubtotal = getCartAmount();
            const { data } = await axios.post('/api/coupon/apply', { code: couponCode, cartAmount: currentSubtotal });
            if (data.success) {
                toast.success(data.message);
                setAppliedCoupon(data.couponData);
                setDiscountAmount(data.discountAmount);
            } else {
                toast.error(data.message);
                setAppliedCoupon(null);
                setDiscountAmount(0);
            }
        } catch (error) { toast.error(error.message); } 
        finally { setIsApplying(false); }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode("");
        setDiscountAmount(0);
        toast.success("Coupon removed");
    };

    useEffect(() => {
        if (appliedCoupon) {
            const currentSubtotal = getCartAmount();
            if (currentSubtotal === 0) {
                setAppliedCoupon(null);
                setCouponCode("");
                setDiscountAmount(0);
                return;
            }
            if (currentSubtotal < appliedCoupon.minCartValue) {
                handleRemoveCoupon();
                toast.error("Coupon removed: Cart total dropped below minimum requirement.");
            } else {
                if (appliedCoupon.discountType === 'percent') {
                    setDiscountAmount((currentSubtotal * appliedCoupon.discountValue) / 100);
                }
            }
        }
    }, [cartItems]);

    const placeOrder = async ()=>{
        try {
            if(!selectedAddress) return toast.error("Please select an address")

            // ✅ Frontend minimum order check
            if (!isMinOrderMet) {
                return toast.error(`Minimum order amount is ₹${MIN_ORDER_AMOUNT}. Add ₹${amountNeeded} more to proceed.`);
            }

            const orderPayload = {
                userId: user._id,
                items: cartArray.map(item=> ({product: item._id, quantity: cartItems[item._id]})),
                address: selectedAddress._id,
                couponCode: appliedCoupon ? appliedCoupon.code : null,
                discountValue: discountAmount,
                deliveryPreference: deliveryHours,
                deliveryFee: expressFee
            };

            if(paymentOption === "COD"){
                const {data} = await axios.post('/api/order/cod', orderPayload);
                if(data.success){
                    toast.success(data.message)
                    setCartItems({})
                    navigate('/my-orders')
                }else{ toast.error(data.message) }
            }else{
                const {data} = await axios.post('/api/order/razorpay', orderPayload);
                if(data.success){
                    const options = {
                        key: "rzp_test_SfUoUFHQYqa2mk", 
                        amount: data.order.amount, 
                        currency: data.order.currency,
                        name: "Fruzo",
                        description: "Fresh Produce Delivery",
                        order_id: data.order.id, 
                        handler: async (response) => {
                            try {
                                const verifyData = await axios.post('/api/order/verifyRazorpay', {
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                    orderId: data.order.receipt, 
                                    userId: user._id
                                });

                                if (verifyData.data.success) {
                                    toast.success(verifyData.data.message);
                                    setCartItems({});
                                    navigate('/my-orders');
                                } else { toast.error(verifyData.data.message); }
                            } catch (error) { toast.error("Payment Verification Failed"); }
                        },
                        theme: { color: "#16a34a" }
                    };
                    const rzp = new window.Razorpay(options);
                    rzp.open();
                }else{ toast.error(data.message) }
            }
        } catch (error) { toast.error(error.message) }
    }

    useEffect(()=>{ if(products.length > 0 && cartItems) getCart() },[products, cartItems])
    useEffect(()=>{ if(user) getUserAddress() },[user])
    
    return products.length > 0 && cartItems ? (
        <div className="flex flex-col md:flex-row mt-16 gap-8">
            <div className='flex-1 max-w-4xl'>
                <h1 className="text-3xl font-medium mb-6">
                    Shopping Cart <span className="text-sm text-primary">{getCartCount()} Items</span>
                </h1>

                <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-base font-medium pb-3 border-b border-gray-200">
                    <p className="text-left">Product Details</p>
                    <p className="text-center">Subtotal</p>
                    <p className="text-center">Action</p>
                </div>

                {cartArray.map((product, index) => (
                    <div key={index} className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 items-center text-sm md:text-base font-medium pt-4 pb-4 border-b border-gray-100">
                        <div className="flex items-center md:gap-6 gap-3">
                            <div onClick={()=>{
                                navigate(`/products/${product.category.toLowerCase()}/${product._id}`);
                                window.scrollTo(0,0)
                            }} className="cursor-pointer w-24 h-24 flex items-center justify-center border border-gray-200 rounded overflow-hidden hover:border-primary transition">
                                <img className="w-full h-full object-cover" src={product?.image?.[0] || ''} alt={product?.name || 'product'} />
                            </div>
                            <div>
                                <p className="hidden md:block font-semibold text-gray-800">{product?.name}</p>
                                <div className="font-normal text-gray-500/70 mt-1">
                                    <p className="text-xs sm:text-sm">Weight: <span>{product?.weight || product?.unit || "N/A"}</span></p>
                                    
                                    <div className='flex items-center gap-3 mt-2'>
                                        <div className="flex items-center justify-between bg-primary/10 border border-primary/30 rounded-md text-primary text-sm w-[80px] h-[32px] select-none">
                                            <button onClick={() => removeFromCart(product._id)} className="w-1/3 h-full flex items-center justify-center font-bold hover:bg-primary/20 rounded-l-md cursor-pointer">-</button>
                                            <span className="w-1/3 text-center font-medium text-gray-800">{cartItems[product._id]}</span>
                                            <button onClick={() => addToCart(product._id)} className="w-1/3 h-full flex items-center justify-center font-bold hover:bg-primary/20 rounded-r-md cursor-pointer">+</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-gray-800">{currency}{(product?.offerPrice || 0) * cartItems[product._id]}</p>
                        <button onClick={()=> updateCartItem(product._id, 0)} className="cursor-pointer mx-auto">
                            <img src={assets.remove_icon} alt="remove" className="inline-block w-5 h-5 opacity-70 hover:opacity-100 transition" />
                        </button>
                    </div>)
                )}

                <button onClick={()=> {navigate("/products"); window.scrollTo(0,0)}} className="group cursor-pointer flex items-center mt-8 gap-2 text-primary font-medium hover:text-green-700 transition">
                    <img className="group-hover:-translate-x-1 transition" src={assets.arrow_right_icon_colored} alt="arrow" />
                    Continue Shopping
                </button>
            </div>

            <div className="max-w-[380px] w-full h-max">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-800 mb-5">Order Summary</h2>

                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-xs font-bold uppercase text-gray-500 tracking-wider">Delivery To</p>
                            <button onClick={() => setShowAddress(!showAddress)} className="text-primary hover:text-green-700 font-medium cursor-pointer text-xs uppercase tracking-wider">Change</button>
                        </div>
                        
                        <div className="relative">
                            <div className="bg-white border border-gray-200 rounded p-3 text-sm text-gray-600 shadow-sm">
                                {selectedAddress ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}` : "No address found"}
                            </div>
                            
                            {showAddress && addresses?.length > 0 && (
                                <div className="absolute top-full mt-2 py-2 bg-white shadow-xl border border-gray-200 rounded-md text-sm w-full z-50 max-h-48 overflow-y-auto">
                                {addresses.map((address, index)=>(
                                    <div key={index} onClick={() => {setSelectedAddress(address); setShowAddress(false)}} className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition">
                                        <p className="font-medium text-gray-800">{address.street}</p>
                                        <p className="text-gray-500 text-xs mt-0.5">{address.city}, {address.state}</p>
                                    </div>
                                )) }
                                    <div onClick={() => navigate("/add-address")} className="text-primary text-center font-medium cursor-pointer p-3 hover:bg-primary/5 border-t border-gray-100 bg-gray-50">
                                        + Add New Address
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mb-6">
                        <p className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">Discount Code</p>
                        {appliedCoupon ? (
                            <div className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded-md shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 text-green-600 p-1.5 rounded-full">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-green-700 uppercase">{appliedCoupon.code}</p>
                                            <span className="text-[10px] font-bold bg-green-200 text-green-800 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                {appliedCoupon.discountType === 'percent' ? `${appliedCoupon.discountValue}% OFF` : `FLAT ${currency}${appliedCoupon.discountValue} OFF`}
                                            </span>
                                        </div>
                                        <p className="text-xs text-green-600 mt-0.5 font-medium">Woohoo! You saved {currency}{discountAmount.toFixed(2)}</p>
                                    </div>
                                </div>
                                <button onClick={handleRemoveCoupon} className="text-gray-400 hover:text-red-500 transition cursor-pointer" title="Remove Coupon">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>
                        ) : (
                            <div className="flex w-full shadow-sm">
                                <input 
                                    type="text" 
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    placeholder="Enter Code" 
                                    className="flex-1 bg-white border border-gray-300 border-r-0 rounded-l-md px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition uppercase placeholder-gray-400"
                                />
                                <button 
                                    onClick={handleApplyCoupon} 
                                    disabled={isApplying || !couponCode}
                                    className="bg-gray-100 border border-gray-300 text-gray-700 px-5 py-2.5 rounded-r-md text-sm font-semibold tracking-wide hover:bg-gray-200 transition disabled:opacity-50 cursor-pointer"
                                >
                                    {isApplying ? "..." : "Apply"}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="mb-6">
                        <p className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">Payment Method</p>
                        <select onChange={e => setPaymentOption(e.target.value)} className="w-full border border-gray-300 rounded-md bg-white px-3 py-2.5 outline-none text-sm font-medium text-gray-700 focus:border-primary focus:ring-1 focus:ring-primary transition cursor-pointer shadow-sm">
                            <option value="COD">Cash On Delivery (COD)</option>
                            <option value="Online">Pay Online (Razorpay)</option>
                        </select>
                    </div>

                    <div className="mb-6">
                        <p className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2 flex justify-between items-center">
                            <span>Delivery Speed</span>
                            {expressFee > 0 && <span className="text-red-500 animate-pulse text-[10px] bg-red-100 px-2 py-0.5 rounded">EXPRESS (+₹150)</span>}
                        </p>
                        <select 
                            value={deliveryHours}
                            onChange={(e) => setDeliveryHours(e.target.value)} 
                            className="w-full border border-gray-300 rounded-md bg-white px-3 py-2.5 outline-none text-sm font-medium text-gray-700 focus:border-primary focus:ring-1 focus:ring-primary transition cursor-pointer shadow-sm"
                        >
                            <option value="1">Deliver in 1 Hour (Fastest) - +₹150</option>
                            <option value="2">Deliver in 2 Hours - +₹150</option>
                            <option value="3">Deliver in 3 Hours - Free</option>
                            <option value="4">Deliver in 4 Hours - Free</option>
                            <option value="5">Deliver in 5 Hours - Free</option>
                            <option value="6">Deliver in 6+ Hours - Free</option>
                        </select>
                    </div>

                    <hr className="border-gray-200 my-5" />

                    <div className="text-gray-600 space-y-3 text-sm">
                        <p className="flex justify-between">
                            <span>Subtotal</span><span className="font-medium text-gray-800">{currency}{getCartAmount()}</span>
                        </p>
                        
                        {appliedCoupon && (
                            <p className="flex justify-between text-green-600 font-medium bg-green-50/50 p-1 -mx-1 px-1 rounded">
                                <span>Discount</span>
                                <span>- {currency}{discountAmount.toFixed(2)}</span>
                            </p>
                        )}

                        <p className="flex justify-between">
                            <span>Delivery Fee</span>
                            <span className={expressFee > 0 ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
                                {expressFee > 0 ? `${currency}${expressFee}` : "Free"}
                            </span>
                        </p>
                        
                        <p className="flex justify-between">
                            <span>Taxes (2%)</span>
                            <span className="font-medium text-gray-800">
                                {currency}{Math.round((getCartAmount() - discountAmount) * 2 / 100)}
                            </span>
                        </p>
                        
                        <div className="flex justify-between items-center text-lg font-bold text-gray-900 mt-5 pt-4 border-t border-gray-300">
                            <span>Total</span>
                            <span className="text-primary">
                                {currency}{Math.round((getCartAmount() - discountAmount) + ((getCartAmount() - discountAmount) * 2 / 100)) + expressFee}
                            </span>
                        </div>
                    </div>

                    {/* ✅ Minimum Order Warning Banner */}
                    {!isMinOrderMet && cartSubtotal > 0 && (
                        <div className="mt-5 bg-orange-50 border border-orange-200 rounded-md px-4 py-3">
                            <p className="text-orange-700 text-xs font-semibold text-center leading-snug">
                                🛒 Minimum order amount is <strong>₹{MIN_ORDER_AMOUNT}</strong>
                            </p>
                            <p className="text-orange-600 text-xs text-center mt-1">
                                Add <strong>₹{amountNeeded}</strong> more to place your order.
                            </p>
                            {/* Progress bar */}
                            <div className="mt-2 w-full bg-orange-100 rounded-full h-1.5">
                                <div
                                    className="bg-orange-400 h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min((cartSubtotal / MIN_ORDER_AMOUNT) * 100, 100)}%` }}
                                />
                            </div>
                            <p className="text-orange-500 text-[10px] text-center mt-1">
                                {Math.round((cartSubtotal / MIN_ORDER_AMOUNT) * 100)}% of minimum order reached
                            </p>
                        </div>
                    )}

                    {/* ✅ STORE OPEN/CLOSE + MIN ORDER CHECKOUT LOGIC */}
                    {!isStoreOpen ? (
                        <div className="w-full mt-7 text-center">
                            <button disabled className="w-full py-3.5 rounded-md bg-gray-300 text-gray-500 font-bold tracking-wide cursor-not-allowed shadow-sm flex justify-center items-center gap-2">
                                CHECKOUT DISABLED
                            </button>
                            <p className="text-red-500 text-xs mt-3 font-medium px-2 leading-tight">Jaiswal Fruits is closed right now. Please try placing your order tomorrow.</p>
                        </div>
                    ) : !isMinOrderMet ? (
                        <div className="w-full mt-5 text-center">
                            <button disabled className="w-full py-3.5 rounded-md bg-gray-200 text-gray-400 font-bold tracking-wide cursor-not-allowed shadow-sm">
                                ADD MORE ITEMS
                            </button>
                        </div>
                    ) : (
                        <button onClick={placeOrder} className="w-full py-3.5 mt-7 rounded-md cursor-pointer bg-primary text-white font-bold tracking-wide hover:bg-green-700 transition shadow-md hover:shadow-lg flex justify-center items-center gap-2">
                            {paymentOption === "COD" ? "PLACE ORDER" : "PROCEED TO PAY"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    ) : null
}

export default Cart;