import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import { Toaster } from "react-hot-toast";
import Footer from './components/Footer';
import { useAppContext } from './context/AppContext';
import Login from './components/Login';
import AllProducts from './pages/AllProducts';
import ProductCategory from './pages/ProductCategory';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import AddAddress from './pages/AddAddress';
import MyOrders from './pages/MyOrders';
import SellerLogin from './components/seller/SellerLogin';
import SellerLayout from './pages/seller/SellerLayout';
import AddProduct from './pages/seller/AddProduct';
import ProductList from './pages/seller/ProductList';
import Orders from './pages/seller/Orders';
import Dashboard from './pages/seller/Dashboard';
import Loading from './components/Loading';
import Contact from './pages/Contact';
import MyProfile from './pages/MyProfile';
import Coupons from './pages/seller/Coupons'; 
import Wishlist from './pages/Wishlist'; 
import BulkPricing from './pages/seller/BulkPricing';
import PredictiveSourcing from './pages/seller/PredictiveSourcing';
import FlashClearance from './pages/seller/FlashClearance';
import StoreStatusBanner from './components/StoreStatusBanner'; // 🚀 IMPORTED BANNER
import axios from 'axios';
axios.defaults.withCredentials = true;
const App = () => {

  const isSellerPath = useLocation().pathname.includes("seller");
  const {showUserLogin, isSeller} = useAppContext()

  return (
    <div className='text-default min-h-screen text-gray-700 bg-white relative'>

     {/* 🚀 BANNER ADDED HERE */}
     {!isSellerPath && <StoreStatusBanner />} 
     
     {isSellerPath ? null : <Navbar/>} 
     {showUserLogin ? <Login/> : null}

     <Toaster />

      <div className={`${isSellerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}`}>
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/products' element={<AllProducts/>} />
          <Route path='/products/:category' element={<ProductCategory/>} />
          <Route path='/products/:category/:id' element={<ProductDetails/>} />
          <Route path='/cart' element={<Cart/>} />
          <Route path='/add-address' element={<AddAddress/>} />
          <Route path='/my-orders' element={<MyOrders/>} />
          <Route path='/profile' element={<MyProfile/>} />
          <Route path='/contact' element={<Contact/>} />
          <Route path='/loader' element={<Loading/>} />
          <Route path='/wishlist' element={<Wishlist/>} />
        
          <Route path='/seller' element={isSeller ? <SellerLayout/> : <SellerLogin/>}>
            <Route index element={isSeller ? <Dashboard/> : null} />
            <Route path='add-product' element={<AddProduct/>} />
            <Route path='product-list' element={<ProductList/>} />
            <Route path='orders' element={<Orders/>} />
            <Route path='coupons' element={<Coupons/>} />
            <Route path='/seller/bulk-pricing' element={<BulkPricing />} />
            <Route path='predictive-sourcing' element={<PredictiveSourcing/>} />
            <Route path='flash-clearance' element={<FlashClearance/>} />
          </Route>
        </Routes>
      </div>
     {!isSellerPath && <Footer/>}

     {/* OMNICHANNEL FLOATING WHATSAPP BUTTON */}
     {!isSellerPath && (
        <a 
          href="https://wa.me/919004381105?text=Hi!%20I%20want%20to%20order%20fruits." 
          target="_blank" 
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 flex items-center justify-center group"
          title="Order via WhatsApp"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.12.551 4.14 1.597 5.952L.147 24l6.19-1.625A11.972 11.972 0 0 0 12.031 24c6.645 0 12.031-5.385 12.031-12.031S18.676 0 12.031 0zm4.566 17.152c-.672.672-1.782.528-2.5.21-.926-.41-2.433-1.057-4.11-2.735-1.677-1.677-2.324-3.184-2.735-4.11-.318-.718-.462-1.828.21-2.5.303-.303.666-.697.876-.906.27-.27.35-.45.525-.8.175-.35.088-.656-.044-.919-.132-.263-.875-2.112-1.2-2.89-.315-.75-.63-.646-.875-.658-.228-.01-.489-.013-.75-.013-.263 0-.687.1-1.047.493-.36.393-1.378 1.347-1.378 3.284 0 1.938 1.411 3.815 1.607 4.078.196.263 2.781 4.248 6.737 5.955 3.955 1.708 3.955 1.138 4.656 1.05.7-.088 2.253-.919 2.57-1.808.315-.888.315-1.65.22-1.808-.095-.158-.358-.254-.708-.429l-2.072-1.026c-.35-.175-1.028-.271-1.291.254-.263.525-.831 1.026-1.05 1.254-.22.228-.438.254-.788.079z"/></svg>
          
          <span className="absolute right-16 bg-white text-gray-800 text-sm font-bold py-2 px-4 rounded-xl shadow-lg border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Order via WhatsApp 🟢
          </span>
        </a>
     )}

    </div>
  )
}

export default App