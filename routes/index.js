import {Router} from 'express';
import coins from './coins.js';
import {refferalCreate,getRefferalUser} from '../controllers/refferalController/refferController.js'
import {decryptRefferal} from '../middleware/index.js';
import admin from './admin.js'
import vendor from './vendor.js'
const route=Router();
route.get('/',(req,res)=>{
    return  res.status(200).json({
        status:"success",
        message:"API is up and running"
    })
})
route.use('/coins',coins)


//refferal routes-->
///api/otp/vendor/number
route.post('/refferal/user/:userId',decryptRefferal(),refferalCreate);
route.get('/refferal/user/:userId',getRefferalUser)
route.post('/signup-user/:userId',decryptRefferal(),refferalCreate);

route.use('/admim',admin);
route.use('/vendor',vendor);
export default route;