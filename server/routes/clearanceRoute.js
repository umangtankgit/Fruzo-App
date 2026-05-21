import express from 'express';
import { getAgingInventory, triggerAutoClearance } from '../controllers/clearanceController.js';

const router = express.Router();

router.get('/aging', getAgingInventory);
router.post('/trigger', triggerAutoClearance);

export default router;