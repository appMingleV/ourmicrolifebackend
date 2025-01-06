import {Router} from 'express';
import {getCoins,addCoinsOnProductBuy,getCoinHistory,coinsToCurrency,getCoinsCurrencyValue} from '../controllers/coinscontroller/coinscontroller.js'



const route=Router();
route.get('/currencyValueNow',getCoinsCurrencyValue)
.get('/:userId',getCoins)
.post('/product/addCoins/:userId',addCoinsOnProductBuy)
.get('/history/:userId',getCoinHistory)
.post('/currencyValue',coinsToCurrency)



export default route;