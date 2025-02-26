import {Router} from 'express';
import {buyOrders,getBuyOrder,orderItems,cancelOrder} from '../controllers/orderController/buyNowController.js'
import multer from 'multer';
const routes=Router();




routes.post('/buyOrders',buyOrders)
routes.get('/buyOrders/:buyId',getBuyOrder)
.post('/orderItems',orderItems)
.put('/:orderId',cancelOrder)
.get('/getAllOrders/:userId',)


export default routes