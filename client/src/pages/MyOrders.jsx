import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { generateInvoice } from '../utils/generateInvoice'

const MyOrders = () => {

    const [myOrders, setMyOrders] = useState([])
    const {currency, axios, user} = useAppContext()

    const [exchangeModal, setExchangeModal] = useState({ isOpen: false, orderId: null });
    const [exchangeReason, setExchangeReason] = useState('Spoiled / Rotten Fruit');
    const [exchangeComment, setExchangeComment] = useState('');

    const fetchMyOrders = async ()=>{
        try {
            const { data } = await axios.get('/api/order/user')
            if(data.success){
                setMyOrders(data.orders)
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(()=>{
        if(user){
            fetchMyOrders()
        }
    },[user])

    const checkCancelEligibility = (createdAt, status) => {
        if (status !== 'Order Placed') return false; 
        const orderTime = new Date(createdAt).getTime();
        const currentTime = new Date().getTime();
        const diffInMinutes = (currentTime - orderTime) / (1000 * 60);
        return diffInMinutes <= 15; 
    }

    const checkExchangeEligibility = (deliveredAt, status, isExchangeRequested) => {
        if (status !== 'Delivered' || isExchangeRequested || !deliveredAt) return false;
        const deliveryTime = new Date(deliveredAt).getTime();
        const currentTime = new Date().getTime();
        const diffInHours = (currentTime - deliveryTime) / (1000 * 60 * 60);
        return diffInHours <= 24; 
    }

    const handleCancelOrder = async (orderId) => {
        if(!window.confirm("Are you sure you want to cancel this order?")) return;
        try {
            const { data } = await axios.post('/api/order/cancel', { orderId });
            if(data.success) {
                toast.success(data.message);
                fetchMyOrders(); 
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const openExchangeModal = (orderId) => {
        setExchangeModal({ isOpen: true, orderId });
        setExchangeReason('Spoiled / Rotten Fruit'); 
        setExchangeComment('');
    }

    const closeExchangeModal = () => {
        setExchangeModal({ isOpen: false, orderId: null });
    }

    const submitExchangeRequest = async (e) => {
        e.preventDefault();
        const finalReason = `${exchangeReason} - ${exchangeComment}`;
        
        const toastId = toast.loading("Submitting your claim...");
        try {
            const { data } = await axios.post('/api/order/exchange', { 
                orderId: exchangeModal.orderId, 
                reason: finalReason 
            });
            if(data.success) {
                toast.success("Claim submitted successfully!", { id: toastId });
                closeExchangeModal();
                fetchMyOrders(); 
            } else {
                toast.error(data.message, { id: toastId });
            }
        } catch (error) {
            toast.error(error.message, { id: toastId });
        }
    }

  return (
    <div className='mt-16 pb-16 relative'>
        <div className='flex flex-col items-end w-max mb-8'>
            <p className='text-2xl font-medium uppercase'>My orders</p>
            <div className='w-16 h-0.5 bg-primary rounded-full'></div>
        </div>

        {myOrders.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 border border-dashed border-gray-300 rounded-lg max-w-4xl">
                <p className="text-gray-500 font-medium">No orders placed yet.</p>
            </div>
        ) : null}

        {myOrders.map((order, index)=>(
            <div key={index} className={`border rounded-xl mb-10 p-0 overflow-hidden max-w-4xl shadow-sm hover:shadow-md transition-shadow ${order.status === 'Cancelled by Customer' ? 'border-red-300 opacity-70' : 'border-gray-200'}`}>
                
                <div className="bg-gray-50/50 border-b border-gray-200 px-5 py-4 flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">ORDER ID: <span className="font-mono text-gray-800 ml-1">{order._id.slice(-8).toUpperCase()}</span></p>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">PLACED: <span className="text-gray-800 ml-1 font-medium">{new Date(order.createdAt).toLocaleString()}</span></p>
                    </div>
                    
                    <div>
                        <span className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border
                            ${['Cancelled by Customer', 'Rejected by Seller'].includes(order.status) ? 'bg-red-50 text-red-600 border-red-200' : ''}
                            ${order.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                            ${order.status === 'Exchange Requested' ? 'bg-orange-50 text-orange-700 border-orange-200' : ''}
                            ${!['Cancelled by Customer', 'Rejected by Seller', 'Delivered', 'Exchange Requested'].includes(order.status) ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                        `}>
                            {order.status}
                        </span>
                    </div>
                </div>

                {order.items.map((item, idx) => (
                    <div key={idx} className={`relative bg-white text-gray-700 ${order.items.length !== idx + 1 ? "border-b border-gray-100" : ""} flex flex-col md:flex-row md:items-center justify-between p-5 w-full`}>
                      <div className='flex items-center mb-4 md:mb-0 flex-1'>
                        <div className='w-16 h-16 bg-white border border-gray-200 p-2 rounded-lg shrink-0 flex items-center justify-center shadow-sm'>
                         <img src={item.product?.image?.[0]} alt="product" className='max-w-full max-h-full object-contain' />
                         </div>
                         <div className='ml-4'>
                            <h2 className='text-base font-bold text-gray-800'>{item.product?.name}</h2>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">Category: {item.product?.category}</p>
                            <p className="text-xs font-medium text-gray-600 mt-1 bg-gray-50 px-2 py-0.5 rounded inline-block border border-gray-200">Unit: {item.product?.unit || '1 pc'} (₹{item.product?.offerPrice})</p>
                         </div>
                       </div>

                        <div className='flex flex-col justify-center md:ml-8 mb-4 md:mb-0 w-32'>
                            <p className="text-sm font-medium text-gray-500">Qty: <span className="font-bold text-gray-800 text-lg bg-gray-100 px-3 py-1 rounded-md ml-1">{item.quantity}</span></p>
                        </div>
                        
                        <div className="w-28 text-right">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Subtotal</p>
                            <p className='text-primary text-xl font-black'>
                                {currency}{item.product?.offerPrice * item.quantity}
                            </p>
                        </div>
                    </div>
                ))}

                <div className="bg-gray-50/50 border-t border-gray-200 px-5 py-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                            Grand Total
                        </p>
                        <p className="text-2xl font-black text-gray-800 mt-0.5">
                            {currency}{order.amount} <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded ml-2 align-middle">via {order.paymentType}</span>
                        </p>

                        {/* FIXED: BULLETPROOF EXPRESS DELIVERY & EXPECTED TIME TEXT */}
                        {Number(order.deliveryFee) > 0 && (
                            <p className="text-xs text-red-600 font-bold mt-1.5 flex items-center gap-1">
                                <span>🚀</span> Includes {currency}{Number(order.deliveryFee)} Express Fee
                            </p>
                        )}
                        <p className="text-xs text-blue-700 font-bold mt-1 flex items-center gap-1">
                            <span>⏱️</span> Expected By: {
                                (order.expectedDeliveryDate && !isNaN(new Date(order.expectedDeliveryDate).getTime())) 
                                ? new Date(order.expectedDeliveryDate).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour12: true, hour: 'numeric', minute: 'numeric' }) 
                                : 'Standard Timing'
                            }
                        </p>

                    </div>

                    <div className="flex gap-3">
                        {order.status !== 'Cancelled by Customer' && order.status !== 'Rejected by Seller' && (
                            <button onClick={() => generateInvoice(order, currency)} className="text-sm font-bold border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 hover:shadow-sm transition">
                                Download Invoice
                            </button>
                        )}

                        {checkCancelEligibility(order.createdAt, order.status) && (
                            <button onClick={() => handleCancelOrder(order._id)} className="text-sm font-bold border border-red-200 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 hover:border-red-300 transition">
                                Cancel Order
                            </button>
                        )}

                        {checkExchangeEligibility(order.deliveredAt, order.status, order.isExchangeRequested) && (
                            <button onClick={() => openExchangeModal(order._id)} className="text-sm font-bold border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 hover:shadow-sm transition">
                                Report Issue
                            </button>
                        )}
                        
                        {order.isExchangeRequested && (
                            <span className="text-sm font-bold text-orange-700 bg-orange-50 px-4 py-2 rounded-lg border border-orange-200 flex items-center gap-2">
                                Claim Under Review
                            </span>
                        )}
                    </div>
                </div>
            </div>
        ))}

        {exchangeModal.isOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 sm:p-6">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col animate-fadeIn">
                    <div className="flex justify-between items-center p-5 border-b border-gray-200 shrink-0">
                        <h3 className="text-lg font-semibold text-gray-800">Report an Issue</h3>
                        <button onClick={closeExchangeModal} className="text-gray-400 hover:text-red-500 font-bold text-2xl leading-none">&times;</button>
                    </div>
                    
                    <div className="p-5">
                        <p className="text-sm text-gray-600 mb-5">We're sorry you had an issue with your fruits. Please let us know what went wrong so we can resolve it.</p>
                        
                        <form onSubmit={submitExchangeRequest}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Issue Type</label>
                                <select 
                                    value={exchangeReason}
                                    onChange={(e) => setExchangeReason(e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2 outline-primary bg-white text-gray-700"
                                    required
                                >
                                    <option value="Spoiled / Rotten Fruit">Spoiled / Rotten Fruit</option>
                                    <option value="Wrong Item Delivered">Wrong Item Delivered</option>
                                    <option value="Missing Item in Package">Missing Item in Package</option>
                                    <option value="Damaged Packaging">Damaged Packaging</option>
                                    <option value="Underweight/Quantity Issue">Underweight / Quantity Issue</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Details (Optional)</label>
                                <textarea 
                                    rows="3" 
                                    value={exchangeComment}
                                    onChange={(e) => setExchangeComment(e.target.value)}
                                    placeholder="e.g., The mangoes were damaged..."
                                    className="w-full border border-gray-300 rounded px-3 py-2 outline-primary resize-none text-sm text-gray-700"
                                ></textarea>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={closeExchangeModal} className="flex-1 border border-gray-300 bg-white text-gray-700 py-2.5 rounded hover:bg-gray-50 transition font-medium">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 bg-primary text-white py-2.5 rounded hover:bg-primary-dull transition font-medium shadow-sm">
                                    Submit Claim
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )}
    </div>
  )
}

export default MyOrders