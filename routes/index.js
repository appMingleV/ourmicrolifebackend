import {Router} from 'express';
import coins from './coins.js';
import {refferalCreate} from '../controllers/refferalController/refferController.js'
import {decryptRefferal} from '../middleware/index.js';

const route=Router();
route.get('/',(req,res)=>{
    return  res.status(200).json({
        status:"success",
        message:"API is up and running"
    })
})
route.use('/coins',coins)


//refferal routes-->
route.post('/refferal/user/:userId',decryptRefferal(),refferalCreate);
route.post('/signup-user/:userId',decryptRefferal(),refferalCreate);


export default route;