import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const PredictiveSourcing = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    const fetchPredictionData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:4000/api/weather/predict');
            if (response.data.success) {
                setData(response.data);
            } else {
                toast.error("Failed to fetch AI Predictions");
            }
        } catch (error) {
            toast.error(error.message);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPredictionData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[70vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto w-full">
            {/* Fruzo Themed Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">AI Predictive Sourcing</h1>
                    <p className="text-gray-500 text-sm md:text-base mt-1">Smart inventory alerts based on 7-day weather forecasts.</p>
                </div>
                <button 
                    onClick={fetchPredictionData} 
                    className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-opacity-90 transition shadow-sm w-full md:w-auto flex justify-center items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    Refresh Model
                </button>
            </div>

            {data && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT COLUMN: WEATHER CARD */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-sm hover:shadow-md transition">
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Upcoming Weather</h2>
                            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{data.avgTemp}°C</div>
                            <p className="font-medium text-gray-700 text-base md:text-lg mb-6">{data.weatherCondition}</p>
                            
                            <div className="space-y-3">
                                {data.forecast.slice(0, 5).map((day, index) => (
                                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                        <span className="text-gray-600 text-sm font-medium">{new Date(day.date).toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                                        <span className="font-semibold text-gray-800 text-sm">{day.temp}°C {day.rain > 0 && `🌧️`}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* TRENDING KEYWORDS */}
                        <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-sm">
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Trending Fruits</h2>
                            <div className="flex flex-wrap gap-2">
                                {data.trendingKeywords.map((word, idx) => (
                                    <span key={idx} className="bg-primary/10 text-primary px-3 py-1.5 rounded-md text-sm font-medium capitalize border border-primary/20">
                                        {word}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: SMART ALERTS */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl p-5 md:p-6 border border-gray-200 shadow-sm h-full">
                            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-5 flex items-center gap-2">
                                <span className="bg-primary/10 text-primary p-2 rounded-md"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg></span>
                                Sourcing Action Plan
                            </h2>

                            <div className="space-y-4">
                                {data.alerts.map((alert, index) => {
                                    // Theme-based coloring for alerts instead of raw red/orange
                                    let alertStyles = "bg-gray-50 border-gray-200 text-gray-700";
                                    let icon = "💡";
                                    if (alert.type === 'CRITICAL') {
                                        alertStyles = "bg-red-50 border-red-200";
                                        icon = "🚨";
                                    } else if (alert.type === 'WARNING') {
                                        alertStyles = "bg-orange-50 border-orange-200";
                                        icon = "📈";
                                    }

                                    return (
                                    <div key={index} className={`p-4 md:p-5 rounded-lg border flex items-start gap-3 md:gap-4 transition hover:shadow-sm ${alertStyles}`}>
                                        <div className="text-xl md:text-2xl mt-0.5">{icon}</div>
                                        <div>
                                            <h3 className={`font-semibold text-base md:text-lg mb-1 ${alert.type === 'CRITICAL' ? 'text-red-700' : alert.type === 'WARNING' ? 'text-orange-700' : 'text-gray-800'}`}>
                                                {alert.product}
                                            </h3>
                                            <p className="text-sm md:text-base text-gray-600 leading-relaxed">{alert.message}</p>
                                        </div>
                                    </div>
                                )})}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PredictiveSourcing;