import express from 'express';
import { getStoreStatus, toggleStoreStatus } from '../controllers/settingsController.js';

const router = express.Router();

router.get('/status', getStoreStatus);
router.post('/toggle', toggleStoreStatus);

export default router;