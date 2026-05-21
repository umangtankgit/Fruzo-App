import axios from 'axios';
import Product from '../models/Product.js';

export const getPredictiveAlerts = async (req, res) => {
    try {
        // 1. Fetch 7-Day Weather Data (EXACTLY MUMBAI COORDINATES)
        const weatherAPI = 'https://api.open-meteo.com/v1/forecast?latitude=19.0760&longitude=72.8777&daily=temperature_2m_max,precipitation_sum&timezone=Asia%2FKolkata';
        const { data } = await axios.get(weatherAPI);

        const daily = data.daily;
        let forecast = [];
        let avgTemp = 0;
        let totalRain = 0;

        for (let i = 0; i < 7; i++) {
            forecast.push({
                date: daily.time[i],
                temp: daily.temperature_2m_max[i],
                rain: daily.precipitation_sum[i]
            });
            avgTemp += daily.temperature_2m_max[i];
            totalRain += daily.precipitation_sum[i]; // Rain is in mm
        }
        
        // Convert to proper Number so JavaScript math doesn't fail
        avgTemp = parseFloat((avgTemp / 7).toFixed(1));

        // 2. The Heuristic Business Logic (AI Predictions tuned for MUMBAI)
        let trendingKeywords = [];
        let weatherCondition = "Normal";

        // Mumbai Monsoon is heavy. 40mm+ in a week triggers rain alert
        if (totalRain > 40) {
            weatherCondition = "🌧️ Heavy Rain / Monsoon Expected";
            trendingKeywords = ['banana', 'pomegranate', 'apple', 'kiwi']; 
        } 
        // Anything above 32.5°C average in Mumbai is very hot/humid
        else if (avgTemp >= 32.5) {
            weatherCondition = "🔥 Hot / Heatwave Expected";
            trendingKeywords = ['watermelon', 'mango', 'coconut', 'lemon', 'melon', 'papaya'];
        } 
        else {
            weatherCondition = "🌤️ Pleasant / Cool Weather";
            trendingKeywords = ['apple', 'orange', 'grapes', 'strawberry', 'dragon fruit'];
        }

        // 3. Match Predictions with Database Inventory
        const products = await Product.find({});
        const alerts = [];

        products.forEach(p => {
            const nameStr = p.name.toLowerCase();
            const isTrending = trendingKeywords.some(keyword => nameStr.includes(keyword));

            if (isTrending) {
                if (!p.inStock) {
                    alerts.push({
                        type: 'CRITICAL',
                        product: p.name,
                        message: `OUT OF STOCK! High demand expected next week due to ${weatherCondition}. Source immediately.`
                    });
                } else {
                    alerts.push({
                        type: 'WARNING',
                        product: p.name,
                        message: `Demand likely to surge by 40-50% due to ${weatherCondition}. Ensure sufficient backup stock.`
                    });
                }
            }
        });

        // If no products match, give a generic smart alert
        if(alerts.length === 0) {
            alerts.push({
                type: 'INFO',
                product: 'General Sourcing',
                message: `Based on ${weatherCondition}, consider sourcing: ${trendingKeywords.join(', ')}.`
            });
        }

        res.json({
            success: true,
            weatherCondition,
            avgTemp,
            forecast,
            alerts,
            trendingKeywords
        });

    } catch (error) {
        console.log("Weather Prediction Error:", error);
        res.json({ success: false, message: error.message });
    }
};