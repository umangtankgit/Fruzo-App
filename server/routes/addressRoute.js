import express from 'express';
import { addAddress, getAddress, deleteAddress } from '../controllers/addressController.js';
import userAuth from '../middlewares/userAuth.js'; // Using the proper middleware path we fixed earlier

const router = express.Router();

router.post('/add', userAuth, addAddress);
router.get('/get', userAuth, getAddress);
// NEW: The delete route connected to our new controller function
router.post('/delete', userAuth, deleteAddress);

export default router;