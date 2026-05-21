import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from 'recharts';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { axios, currency } = useAppContext();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('today');

    const COLORS = ['#16a34a', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`/api/analytics/data?timeframe=${timeframe}`);
            if (data.success) {
                setData(data);
            }
        } catch (error) {
            toast.error("Dashboard error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAnalytics(); }, [timeframe]);

    if (loading) return <div className="p-20 text-center font-medium text-gray-500">Updating Stats...</div>;
    if (!data) return <div className="p-20 text-center text-red-500">Server Error</div>;

    const { stats, charts, lowStockProducts } = data;

    const timeFilters = [
        { id: 'today', label: 'Today' },
        { id: 'yesterday', label: 'Yesterday' },
        { id: '7days', label: '7D' },
        { id: '30days', label: '30D' },
        { id: 'all', label: 'All' }
    ];

    return (
        <div className="w-full px-4 md:px-8 py-8 bg-gray-50/50 min-h-screen pb-24">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Business Dashboard</h2>
                <div className="bg-white border border-gray-200 rounded-lg p-1 flex flex-wrap shadow-sm gap-1">
                    {timeFilters.map(t => (
                        <button 
                            key={t.id} 
                            onClick={() => setTimeframe(t.id)} 
                            className={`px-3 md:px-4 py-1.5 text-[10px] md:text-xs font-bold uppercase rounded transition-all ${timeframe === t.id ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Revenue', val: currency + stats.totalRevenue.toLocaleString() },
                    { label: 'Orders', val: stats.totalOrders },
                    { label: 'B2B Sales', val: currency + stats.b2bRevenue.toLocaleString(), color: 'text-green-600' },
                    { label: 'Customers', val: stats.totalUsers }
                ].map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
                        <p className={`text-3xl font-black mt-1 ${s.color || 'text-gray-800'}`}>{s.val}</p>
                    </div>
                ))}
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2 h-[350px] flex flex-col">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">Revenue Trend</h3>
                    
                    {/* FIXED: Wrapper explicitly separated for chart and fallback UI */}
                    <div className="flex-1 w-full relative">
                        {charts.dailyTrendData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={charts.dailyTrendData}>
                                    <defs><linearGradient id="colRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#16a34a" stopOpacity={0.2}/><stop offset="95%" stopColor="#16a34a" stopOpacity={0}/></linearGradient></defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                                    <Tooltip contentStyle={{borderRadius: '10px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                                    <Area type="monotone" dataKey="Revenue" stroke="#16a34a" strokeWidth={3} fill="url(#colRev)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                                <p className="text-gray-400 text-sm font-medium">No sales data for this period</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[350px] flex flex-col">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">Order Status</h3>
                    
                    {/* FIXED: Wrapper explicitly separated for chart and fallback UI */}
                    <div className="flex-1 w-full relative">
                        {charts.orderStatusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={charts.orderStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {charts.orderStatusData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                                <p className="text-gray-400 text-sm font-medium">No orders yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* PROMO CODE TABLE */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Promo Code Performance</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <tr>
                                <th className="px-8 py-4">Code</th>
                                <th className="px-8 py-4 text-center">Usage</th>
                                <th className="px-8 py-4 text-right">Discount Value</th>
                                <th className="px-8 py-4 text-right">Total Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {charts.promoCodeData.length > 0 ? charts.promoCodeData.map((p, i) => (
                                <tr key={i} className="hover:bg-gray-50 transition">
                                    <td className="px-8 py-4 font-black text-primary">{p.code}</td>
                                    <td className="px-8 py-4 text-center font-bold text-gray-700">{p.usageCount}</td>
                                    <td className="px-8 py-4 text-right text-red-500 font-bold">-{currency}{p.totalDiscountGiven.toLocaleString()}</td>
                                    <td className="px-8 py-4 text-right text-green-600 font-black">{currency}{p.revenueGenerated.toLocaleString()}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan="4" className="px-8 py-12 text-center text-gray-400">No promo codes used in this period.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;