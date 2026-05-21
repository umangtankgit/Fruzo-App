import express from 'express';
import { upload } from '../configs/multer.js';
import authSeller from '../middlewares/authSeller.js';
import authUser from '../middlewares/authUser.js'; 
import { 
    addProduct, 
    changeStock, 
    productById, 
    productList, 
    editProduct, 
    deleteProduct,
    addProductReview,
    updateBulkProducts // <-- NEW: Imported our bulk engine
} from '../controllers/productController.js';

const productRouter = express.Router();

// Existing Routes
productRouter.post('/add', upload.array("images"), authSeller, addProduct);
productRouter.get('/list', productList);
productRouter.post('/id', productById); 
productRouter.post('/stock', authSeller, changeStock);

// ==========================================
// FULL CRUD ROUTES
// ==========================================
productRouter.post('/edit', upload.array("images"), authSeller, editProduct);
productRouter.post('/delete', authSeller, deleteProduct);

// ==========================================
// PILLAR 2: BULK UPDATE ROUTE
// ==========================================
// Only verified sellers can access this bulk edit endpoint
productRouter.post('/bulk-edit', authSeller, updateBulkProducts);

// ==========================================
// REVIEW ROUTE
// ==========================================
productRouter.post('/:id/review', authUser, addProductReview);

export default productRouter;