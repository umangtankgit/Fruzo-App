import express from 'express';
import { getPredictiveAlerts } from '../controllers/weatherController.js';

const router = express.Router();

// Fetch predictive sourcing data
router.get('/predict', getPredictiveAlerts);

// Ye line sabse zaroori thi jo miss ho gayi thi:
export default router;