import {Router} from 'express';
import {buyOrders,getBuyOrder,orderItems,cancelOrder,getAllOrders} from '../controllers/orderController/buyNowController.js'
import multer from 'multer';
const routes=Router();

const storage=multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/orders/');
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
})

const upload=multer({ storage });


routes.post('/buyOrders',buyOrders)
routes.get('/buyOrders/:buyId',getBuyOrder)
.post('/orderItems',upload.single('product_image'),orderItems)
.put('/:orderId',cancelOrder)
.get('/getAllOrders/:userId',getAllOrders)


export default routes