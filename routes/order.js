import {Router} from 'express';
import {buyOrders,getBuyOrder} from '../controllers/orderController/buyNowController.js'
import multer from 'multer';
const routes=Router();

const storage=multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/product/'); // Folder for storing uploaded files
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
 });
 const upload=multer({storage});


routes.post('/buyOrders',upload.single('image'),buyOrders)
routes.get('/buyOrders/:buyId',getBuyOrder)


export default routes