import {Router} from 'express';
import coins from './coins.js';
import {refferalCreate,getRefferalUser,getRefferalUsers,getCheckRefferalCode,signupWithReferralCode} from '../controllers/refferalController/refferController.js'

import user from './user.js'
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

route.post('/signup-user/referral-code',signupWithReferralCode)

//refferal routes-->
///api/otp/vendor/number
route.post('/refferal/user/:userId',decryptRefferal(),refferalCreate);

route.get('/refferal/user/:userId',getRefferalUser)

route.post('/signup-user/:userId',decryptRefferal(),refferalCreate);

route.get('/refferal/user/:userId/:query',getRefferalUsers);

route.get('/refferal-code/has-ref/:ref/iv/:iv',decryptRefferal(),getCheckRefferalCode);




route.use('/admin',admin);
route.use('/vendor',vendor);
route.use('/user',user)
export default route;