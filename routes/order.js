import {Router} from 'express';
import {buyOrders,getBuyOrder} from '../controllers/orderController/buyNowController.js'
import multer from 'multer';
const routes=Router();




routes.post('/buyOrders',buyOrders)
routes.get('/buyOrders/:buyId',getBuyOrder)


export default routes