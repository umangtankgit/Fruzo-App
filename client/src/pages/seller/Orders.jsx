import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const Orders = () => {
    const { currency, axios } = useAppContext()
    const [orders, setOrders] = useState([])
    const [activeTab, setActiveTab] = useState('All Orders')

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get('/api/order/seller');
            if (data.success) {
                setOrders(data.orders)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    };

    const statusHandler = async (event, orderId) => {
        try {
            const newStatus = typeof event === 'string' ? event : event.target.value;
            const { data } = await axios.post('/api/order/status', {
                orderId: orderId,
                status: newStatus
            })
            if (data.success) {
                fetchOrders() 
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        fetchOrders();
    }, [])

    const tabs = ['All Orders', 'New', 'Processing', 'Delivered', 'Issues 🔴'];
    
    const filteredOrders = orders.filter((order) => {
        if (activeTab === 'All Orders') return true;
        if (activeTab === 'New') return order.status === 'Order Placed';
        if (activeTab === 'Processing') return ['Packing', 'Out for delivery'].includes(order.status);
        if (activeTab === 'Delivered') return order.status === 'Delivered';
        if (activeTab === 'Issues 🔴') return ['Cancelled by Customer', 'Rejected by Seller', 'Exchange Requested', 'Refunded', 'Exchange Approved'].includes(order.status);
        return true;
    });

    const getStatusColor = (status) => {
        if (status === 'Order Placed') return 'border-blue-500';
        if (['Packing', 'Out for delivery'].includes(status)) return 'border-orange-400';
        if (status === 'Delivered') return 'border-green-500';
        if (['Cancelled by Customer', 'Rejected by Seller', 'Exchange Requested'].includes(status)) return 'border-red-500';
        return 'border-gray-300';
    }

    return (
        <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col relative px-4 md:px-10 py-8 bg-gray-50">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">Order Management</h2>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Manage and fulfill customer orders efficiently.</p>
                </div>
                <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm flex items-center gap-3">
                    <p className="text-sm font-bold text-gray-600">Total Orders:</p>
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-lg font-black">{orders.length}</span>
                </div>
            </div>

            <div className="flex overflow-x-auto no-scrollbar gap-2 mb-6 border-b border-gray-200 pb-px">
                {tabs.map((tab) => {
                    const count = tab === 'All Orders' ? orders.length : orders.filter(o => {
                        if (tab === 'New') return o.status === 'Order Placed';
                        if (tab === 'Processing') return ['Packing', 'Out for delivery'].includes(o.status);
                        if (tab === 'Delivered') return o.status === 'Delivered';
                        if (tab === 'Issues 🔴') return ['Cancelled by Customer', 'Rejected by Seller', 'Exchange Requested', 'Refunded', 'Exchange Approved'].includes(o.status);
                    }).length;

                    return (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab)}
                            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold whitespace-nowrap transition-all border-b-2 
                                ${activeTab === tab ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100'}
                            `}
                        >
                            {tab}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
                                {count}
                            </span>
                        </button>
                    )
                })}
            </div>

            <div className="flex flex-col gap-5 max-w-6xl pb-10">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-dashed border-gray-300 rounded-xl">
                        <span className="text-4xl mb-3 block">📦</span>
                        <p className="text-gray-500 font-bold text-lg">No orders in this tab.</p>
                    </div>
                ) : null}

                {filteredOrders.map((order, index) => (
                    <div key={index} className={`bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border-l-4 ${getStatusColor(order.status)}`}>
                        
                        <div className="bg-gray-50/50 border-b border-gray-100 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white border border-gray-200 rounded flex items-center justify-center p-1 shrink-0 shadow-sm hidden md:flex">
                                    <img src={order.items[0]?.product?.image?.[0] || ''} alt="product" className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</p>
                                    <p className="font-mono font-bold text-gray-800 text-base">#{order._id.slice(-8).toUpperCase()}</p>
                                </div>
                                <div className="h-8 w-px bg-gray-300 hidden md:block"></div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date Placed</p>
                                    <p className="font-medium text-gray-700 text-sm mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="text-right mr-2 hidden sm:block">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Amount</p>
                                    <p className="text-lg font-black text-primary leading-tight">{currency}{order.amount}</p>
                                </div>
                                
                                <select
                                    onChange={(e) => statusHandler(e, order._id)}
                                    value={order.status}
                                    className={`py-2 px-3 text-sm font-bold outline-none rounded-lg border cursor-pointer shadow-sm min-w-[160px]
                                        ${order.status === 'Exchange Requested' || order.status.includes('Cancel') || order.status.includes('Reject') ? 'bg-red-50 border-red-200 text-red-700' : 
                                          order.status === 'Delivered' ? 'bg-green-50 border-green-200 text-green-700' : 
                                          order.status === 'Exchange Approved' ? 'bg-orange-50 border-orange-300 text-orange-700' : 
                                          'bg-white border-gray-300 text-gray-800 focus:border-primary focus:ring-1 focus:ring-primary'}
                                    `}
                                >
                                    <option value="Order Placed">Order Placed</option>
                                    <option value="Packing">Packing</option>
                                    <option value="Out for delivery">Out for delivery</option>
                                    <option value="Delivered">Delivered</option>
                                    <option disabled>──────────</option>
                                    <option value="Cancelled by Customer">Cancelled by Customer</option>
                                    <option value="Exchange Requested" disabled>Exchange Requested</option>
                                    <option value="Exchange Approved">Exchange Approved (Sent)</option>
                                    <option value="Refunded">Refunded</option>
                                    <option value="Rejected by Seller">Reject & Refund</option>
                                </select>
                            </div>
                        </div>

                        {/* ======================================================== */}
                        {/* 🚀 FIXED: BULLETPROOF EXPRESS DELIVERY DEADLINE BAR 🚀 */}
                        {/* ======================================================== */}
                        {order.status !== 'Delivered' && order.status !== 'Cancelled by Customer' && order.status !== 'Refunded' && (
                            <div className={`px-6 py-2.5 flex items-center justify-between border-b ${Number(order.deliveryFee) > 0 ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                                <div className="flex items-center gap-3">
                                    <span className={`text-2xl ${Number(order.deliveryFee) > 0 ? 'animate-bounce' : ''}`}>
                                        {Number(order.deliveryFee) > 0 ? '🚀' : '⏳'}
                                    </span>
                                    <div>
                                        <p className={`text-sm font-black uppercase tracking-wide ${Number(order.deliveryFee) > 0 ? 'text-red-800' : 'text-blue-800'}`}>
                                            {Number(order.deliveryFee) > 0 ? 'Express Order' : 'Standard Delivery'}
                                        </p>
                                        <p className={`text-sm mt-0.5 ${Number(order.deliveryFee) > 0 ? 'text-red-700' : 'text-blue-700'}`}>
                                            <span className="font-bold">Deliver By:</span> {
                                                (order.expectedDeliveryDate && !isNaN(new Date(order.expectedDeliveryDate).getTime())) 
                                                ? new Date(order.expectedDeliveryDate).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour12: true, hour: 'numeric', minute: 'numeric' }) 
                                                : 'Standard Routing'
                                            }
                                        </p>
                                    </div>
                                </div>
                                {Number(order.deliveryFee) > 0 && (
                                    <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm tracking-wider">HIGH PRIORITY</span>
                                )}
                            </div>
                        )}

                        {order.isExchangeRequested && (
                            <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl animate-pulse">🚨</span>
                                    <div>
                                        <p className="text-sm font-black text-red-800 uppercase tracking-wide">Customer Issue Reported</p>
                                        <p className="text-sm text-red-700 mt-0.5"><span className="font-bold">Reason:</span> {order.exchangeReason}</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => { if(window.confirm('Are you sure you want to refund this order?')) statusHandler('Refunded', order._id) }} 
                                        className="bg-white border border-red-300 text-red-600 hover:bg-red-100 font-bold px-4 py-2 rounded-lg shadow-sm text-sm transition"
                                    >
                                        Approve Refund
                                    </button>
                                    <button 
                                        onClick={() => { if(window.confirm('Are you sure you want to send a replacement box? (This will reduce stock)')) statusHandler('Exchange Approved', order._id) }} 
                                        className="bg-red-600 border border-red-700 text-white hover:bg-red-700 font-bold px-4 py-2 rounded-lg shadow-sm text-sm transition"
                                    >
                                        Send Replacement
                                    </button>
                                </div>
                            </div>
                        )}

                        {(!order.isExchangeRequested && order.exchangeReason) && (
                            <div className="bg-gray-100 border-b border-gray-200 px-6 py-2.5 flex items-center gap-3">
                                <span className="text-lg">✅</span>
                                <p className="text-sm font-bold text-gray-700">Claim Resolved: <span className="font-medium text-gray-600">{order.exchangeReason}</span></p>
                            </div>
                        )}

                        {order.status === 'Cancelled by Customer' && (
                            <div className="bg-gray-100 border-b border-gray-200 px-6 py-2.5 flex items-center gap-3">
                                <span className="text-lg">🚫</span>
                                <p className="text-sm font-bold text-gray-600">This order was cancelled by the customer before delivery.</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-0">
                            
                            <div className="p-6 border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                            {order.address.firstName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-base">{order.address.firstName} {order.address.lastName}</p>
                                            <p className="text-xs text-gray-500 font-medium">📞 {order.address.phone}</p>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Delivery Address</p>
                                        <p className="text-sm text-gray-700">{order.address.street}</p>
                                        <p className="text-sm text-gray-700">{order.address.city}, {order.address.state} - {order.address.zipcode}</p>
                                    </div>
                                </div>
                                
                                <div className="mt-4 flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-0.5">Payment Method</p>
                                        <p className="text-sm font-bold text-gray-800">{order.paymentType}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-0.5">Payment Status</p>
                                        {['Cancelled by Customer', 'Rejected by Seller', 'Refunded'].includes(order.status) ? (
                                            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-red-100 text-red-700">
                                                {order.status === 'Refunded' ? "REFUNDED" : "CANCELLED"}
                                            </span>
                                        ) : (
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {order.isPaid ? (order.paymentType === 'COD' ? "PAID (COD)" : "PAID") : "PENDING"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-white">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Items to Pack ({order.items.length})</p>
                                <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto no-scrollbar pr-2">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4 bg-gray-50/50 border border-gray-100 p-2.5 rounded-lg">
                                            <div className="w-14 h-14 bg-white border border-gray-200 rounded flex items-center justify-center p-1 shrink-0 shadow-sm">
                                                <img src={item.product?.image?.[0] || ''} alt="product" className="w-full h-full object-contain" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-800 text-sm truncate">{item.product?.name}</p>
                                                <p className="text-xs text-gray-500 font-medium mt-0.5">Unit: <span className="text-gray-700">{item.product?.unit || '1 pc'}</span></p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-xs text-gray-500 font-medium mb-0.5">Qty</p>
                                                <div className="bg-primary/10 text-primary font-black text-sm px-3 py-1 rounded-md">
                                                    x{item.quantity}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Orders