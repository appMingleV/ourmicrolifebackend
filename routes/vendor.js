import { Router } from "express";
import multer from "multer";

import { otpSend, verifyOtpNumber, verifyOtpSignup,emailOTP, signup,vendorDetails,login } from '../controllers/vendorAuth/vendorAuthController.js'

import {dimensionsProduct,getDimensionProduct} from '../controllers/vendorAuth/product.js'
import store from './store.js'
const routes=Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/vendor/'); // Folder for storing uploaded files
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage:storage });
//uplaod images multiply
const multipleupload = upload.fields([{ name: 'aadharNumberFront',maxCount: 1  }, { name: 'aadharNumberBack',maxCount: 1  }, { name: 'PANDocument',maxCount: 1  }, { name: 'DocumentProof',maxCount: 1  }]);





routes.post('/signup', multipleupload, signup)
///api/otp/vendor/number
//otp sending to given number-->
routes.post('/otp/vendor/number', otpSend)

//otp for email sending to given email-->
routes.post('/otp/vendor/email', emailOTP)

///api/vendor/signup/verifyOTP
//verify the OTP-->
routes.post('/verifyOTP', verifyOtpNumber);
routes.post('/signup/verifyOTP', verifyOtpSignup);




//get vendor details-->
routes.get('/:vendorId',vendorDetails)


//dimenesion of product added--->
routes.post('/dimension/product/:productId',dimensionsProduct)
routes.get('/dimension/product/:product',getDimensionProduct)


routes.use('/stores',store);
//shop details-->


//vendor login
routes.post('/login',login)






export default routes;