import React, { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const Navbar = () => {
    const [open, setOpen] = React.useState(false)
    // NEW: Added wishlistItems to extract the count
    const {user, setUser, setShowUserLogin, navigate, setSearchQuery, searchQuery, getCartCount, axios, wishlistItems} = useAppContext();

    const logout = async ()=>{
      try {
        const { data } = await axios.get('/api/user/logout')
        if(data.success){
          toast.success(data.message)
          setUser(null);
          navigate('/')
        }else{
          toast.error(data.message)
        }
      } catch (error) {
        toast.error(error.message)
      }
    }

    useEffect(()=>{
      if(searchQuery.length > 0){
        navigate("/products")
      }
    },[searchQuery])

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white relative transition-all z-50">

      <NavLink to='/' onClick={()=> setOpen(false)}>
        <img className="h-10 md:h-16 w-auto object-contain" src={assets.logo} alt="Fruzo logo" />
      </NavLink>

      <div className="hidden sm:flex items-center gap-8">
        <NavLink to='/'>Home</NavLink>
        <NavLink to='/products'>All Products</NavLink>
        <NavLink to='/contact'>Contact</NavLink>

        <div className="hidden lg:flex items-center text-sm gap-2 border border-gray-300 px-3 rounded-full">
          <input onChange={(e)=> setSearchQuery(e.target.value)} className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500" type="text" placeholder="Search for fresh fruits" />
         <img src={assets.search_icon} alt='search' className='w-5 h-5'/>
        </div>

        {/* ICONS CONTAINER (Wishlist + Cart) */}
        <div className="flex items-center gap-5">
          
          {/* NEW: WISHLIST ICON */}
          <div onClick={()=> navigate("/wishlist")} className="relative cursor-pointer group">
            <svg className="w-6 h-6 text-gray-700 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
            <button className="absolute -top-2 -right-3 text-[10px] font-bold text-white bg-red-500 w-[18px] h-[18px] rounded-full flex items-center justify-center">
              {wishlistItems?.length || 0}
            </button>
          </div>

          {/* CART ICON */}
          <div onClick={()=> navigate("/cart")} className="relative cursor-pointer">
            <img src={assets.nav_cart_icon} alt='cart' className='w-6 opacity-80'/>
            <button className="absolute -top-2 -right-3 text-[10px] font-bold text-white bg-primary w-[18px] h-[18px] rounded-full flex items-center justify-center">
              {getCartCount()}
            </button>
          </div>

        </div>

      {!user ? ( <button onClick={()=> setShowUserLogin(true)} className="cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition text-white rounded-full">
          Login
        </button>)
        :
        (
          <div className='relative group'>
            <img 
              src={user.profilePhoto || assets.profile_icon} 
              className='w-10 h-10 rounded-full object-cover border border-gray-200 bg-white cursor-pointer' 
              alt="Profile" 
            />
            <ul className='hidden group-hover:block absolute top-10 right-0 bg-white shadow border border-gray-200 py-2.5 w-32 rounded-md text-sm z-50'>
              <li onClick={()=> navigate("/profile")} className='p-1.5 pl-3 hover:bg-primary/10 cursor-pointer'>My Profile</li>
              <li onClick={()=> navigate("/my-orders")} className='p-1.5 pl-3 hover:bg-primary/10 cursor-pointer'>My Orders</li>
              <li onClick={()=> navigate("/wishlist")} className='p-1.5 pl-3 hover:bg-primary/10 cursor-pointer'>My Wishlist</li>
              <li onClick={logout} className='p-1.5 pl-3 hover:bg-primary/10 cursor-pointer'>Logout</li>
            </ul>
          </div>
        )}
      </div>

      {/* MOBILE MENU TRIGGER & ICONS */}
      <div className='flex items-center gap-6 sm:hidden'>
        
        {/* NEW: WISHLIST ICON (MOBILE) */}
        <div onClick={()=> navigate("/wishlist")} className="relative cursor-pointer">
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
          </svg>
          <button className="absolute -top-2 -right-3 text-[10px] font-bold text-white bg-red-500 w-[18px] h-[18px] rounded-full flex items-center justify-center">
            {wishlistItems?.length || 0}
          </button>
        </div>

        <div onClick={()=> navigate("/cart")} className="relative cursor-pointer">
            <img src={assets.nav_cart_icon} alt='cart' className='w-6 opacity-80'/>
            <button className="absolute -top-2 -right-3 text-[10px] font-bold text-white bg-primary w-[18px] h-[18px] rounded-full flex items-center justify-center">
              {getCartCount()}
            </button>
        </div>
        
        <button onClick={() => setOpen(!open)} aria-label="Menu" className="">
          <img src={assets.menu_icon} alt='menu'/>
        </button>
      </div>
      
      {/* MOBILE DROP DOWN */}
      { open && (
        <div className="flex absolute top-[100%] left-0 w-full bg-white shadow-xl border-b border-gray-200 py-4 flex-col items-start gap-3 px-5 text-base md:hidden z-50">
        
        <div className="flex w-full items-center text-sm gap-2 border border-gray-300 px-3 rounded-full mb-2">
          <input onChange={(e)=> setSearchQuery(e.target.value)} className="py-2 w-full bg-transparent outline-none placeholder-gray-500" type="text" placeholder="Search for fresh fruits" />
          <img src={assets.search_icon} alt='search' className='w-5 h-5'/>
        </div>

        <NavLink to="/" className="w-full pb-2 border-b border-gray-100" onClick={()=> setOpen(false)}>Home</NavLink>
        <NavLink to="/products" className="w-full pb-2 border-b border-gray-100" onClick={()=> setOpen(false)}>All Products</NavLink>
        
        {user && (
          <>
            <NavLink to="/profile" className="w-full pb-2 border-b border-gray-100" onClick={()=> setOpen(false)}>My Profile</NavLink>
            <NavLink to="/my-orders" className="w-full pb-2 border-b border-gray-100" onClick={()=> setOpen(false)}>My Orders</NavLink>
            <NavLink to="/wishlist" className="w-full pb-2 border-b border-gray-100" onClick={()=> setOpen(false)}>My Wishlist</NavLink>
          </>
        )}
        
        <NavLink to="/contact" className="w-full pb-2 border-b border-gray-100" onClick={()=> setOpen(false)}>Contact</NavLink>

        {!user ? (
          <button onClick={()=>{
            setOpen(false);
            setShowUserLogin(true);
          }} className="cursor-pointer px-6 py-2.5 mt-2 bg-primary hover:bg-primary-dull transition text-white rounded-full text-sm w-full">
          Login
        </button>
        ) : (
          <button onClick={()=>{ setOpen(false); logout(); }} className="cursor-pointer px-6 py-2.5 mt-2 w-full bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition rounded-full text-sm font-medium">
          Logout
        </button>
        )}
        
      </div>
      )}

    </nav>
  )
}

export default Navbar
