import {Router} from 'express';
import {getCoins,addCoinsOnProductBuy,getCoinHistory} from '../controllers/coinscontroller/coinscontroller.js'



const route=Router();

route.get('/:userId',getCoins);
route.post('/product/addCoins/:userId',addCoinsOnProductBuy);
route.get('/history/:userId',getCoinHistory);
export default route;