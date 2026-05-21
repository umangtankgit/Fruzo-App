import React, { useState, useEffect } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const SellerLayout = () => {
    const { axios, navigate } = useAppContext();
    const [isStoreOpen, setIsStoreOpen] = useState(true);

    const sidebarLinks = [
        { name: "Dashboard", path: "/seller", icon: assets.order_icon }, 
        { name: "Add Product", path: "/seller/add-product", icon: assets.add_icon },
        { name: "Product List", path: "/seller/product-list", icon: assets.product_list_icon },
        { name: "Orders", path: "/seller/orders", icon: assets.order_icon },
        { name: "Coupons", path: "/seller/coupons", icon: assets.product_list_icon },
        { name: "Mandi Rates", path: "/seller/bulk-pricing", icon: assets.product_list_icon },
        { name: "AI Sourcing", path: "/seller/predictive-sourcing", icon: assets.product_list_icon },
        { name: "Flash Clearance", path: "/seller/flash-clearance", icon: assets.order_icon },
    ];

    // Fetch initial status
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const { data } = await axios.get('/api/settings/status');
                if(data.success) setIsStoreOpen(data.isStoreOpen);
            } catch (error) { console.log(error); }
        };
        fetchStatus();
    }, [axios]);

    // Toggle API Call
    const toggleStore = async () => {
        try {
            const { data } = await axios.post('/api/settings/toggle');
            if(data.success) {
                setIsStoreOpen(data.isStoreOpen);
                toast.success(data.message);
            }
        } catch (error) { toast.error("Failed to toggle store status"); }
    };

    const logout = async ()=>{
        try {
            const { data } = await axios.get('/api/seller/logout');
            if(data.success){
                toast.success(data.message)
                navigate('/')
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    return (
        <>
            <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-3 bg-white">
                <Link to='/'>
                    <img className="h-10 sm:h-20 md:h-17 w-auto object-contain" src={assets.logo} alt="Fruzo logo" />
                </Link>
                <div className="flex items-center gap-4 md:gap-6 text-gray-500">
                    
                    {/* STORE TOGGLE SWITCH */}
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full shadow-sm">
                        <span className={`hidden md:block text-xs font-bold uppercase tracking-wide ${isStoreOpen ? 'text-primary' : 'text-red-500'}`}>
                            {isStoreOpen ? 'Store Open' : 'Store Closed'}
                        </span>
                        <button 
                            onClick={toggleStore} 
                            className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${isStoreOpen ? 'bg-primary' : 'bg-red-500'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform duration-300 ${isStoreOpen ? 'translate-x-6' : 'translate-x-1'}`}></div>
                        </button>
                    </div>

                    <div className="hidden md:block border-l border-gray-300 pl-4">
                        <p className="font-medium text-sm text-gray-600">Hi! Admin</p>
                    </div>
                    <button onClick={logout} className='border border-gray-300 rounded-full text-sm px-4 py-1.5 hover:bg-gray-50 transition font-medium'>Logout</button>
                </div>
            </div>
            <div className="flex">
               <div className="md:w-64 w-16 shrink-0 border-r h-[95vh] text-base border-gray-300 pt-4 flex flex-col">
                {sidebarLinks.map((item) => (
                    <NavLink to={item.path} key={item.name} end={item.path === "/seller"}
                        className={({isActive})=>`flex items-center justify-center md:justify-start py-3 px-0 md:px-4 gap-3 
                            ${isActive ? "border-r-4 md:border-r-[6px] bg-primary/10 border-primary text-primary"
                                : "hover:bg-gray-100/90 border-white text-gray-600"
                            }`
                        }
                    >
                        <img src={item.icon} alt="" className="w-6 h-6 md:w-7 md:h-7 object-contain opacity-70 shrink-0" />
                        <p className="md:block hidden text-left font-medium">{item.name}</p>
                    </NavLink>
                ))}
            </div> 
                <div className="flex-1 w-full h-[95vh] overflow-y-auto">
                    <Outlet/>
                </div>
            </div>
             
        </>
    );
};

export default SellerLayout;