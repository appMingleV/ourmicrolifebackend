import {Router} from 'express';
import {getCoins} from '../controllers/coinscontroller/coinscontroller.js'



const route=Router();

route.get('/:userId',getCoins);

export default route;