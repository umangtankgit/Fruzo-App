import express from 'express';
import { getDashboardData } from '../controllers/analyticsController.js';

const analyticsRouter = express.Router();

analyticsRouter.get('/data', getDashboardData);

export default analyticsRouter;