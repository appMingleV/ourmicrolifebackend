import { Router } from "express";
import multer from "multer";

import { otpSend, verifyOtpNumber, verifyOtpSignup,emailOTP, signup,vendorDetails,login} from '../controllers/vendorAuth/vendorAuthController.js'
import {getAllOrders,getSingleOrder} from '../controllers/vendorAuth/shopDetails.js'
import {dimensionsProduct,getDimensionProduct,editProduct,deleteProduct,addProduct,getAllProductVendor,getSingleProduct,delateImage,delatePriceProduct,delateConfigProduct} from '../controllers/vendorAuth/product.js'
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
routes.get('/dimension/product/:productId',getDimensionProduct)

const thumbnailStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/product/"); // Directory for thumbnail
    },
  
    filename: (req, file, cb) => {
   
      cb(null, Date.now() + "-" + file.originalname); // Unique name for thumbnail
    },
  });
  
const uploadThumbnail = multer({ storage: thumbnailStorage });


routes.put('/product/:productId',uploadThumbnail.any(),editProduct);
//add product -->

routes.post("/product/:vendorId",
  uploadThumbnail.any()
  ,addProduct);


//product edit --->
routes.put('/product')
.delete('/product/:productId',deleteProduct)
.get('/order/:vendorId',getAllOrders)
.get('/orderSingle/:orderId',getSingleOrder)
.get('/productAll/:vendorId',getAllProductVendor)
.get('/product/:productId',getSingleProduct)
.delete('/productImage/:imageId',delateImage)
.delete('/productPrice/:priceId',delatePriceProduct)
.delete('/productConfig/:configId',delateConfigProduct)
.get('/dashboard/:vendorId',)
routes.use('/stores',store);
//shop details-->


//vendor login
routes.post('/login',login)






export default routes;