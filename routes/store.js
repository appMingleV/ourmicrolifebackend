import { Router } from "express";
import {shopDetails,editShopDetails,allStores,showProductsDetails,getProductCategoriesSubCate} from '../controllers/vendorAuth/shopDetails.js'

import {otpSend,verifyOtpSignup,emailOTP,signup} from '../controllers/storeController/storeController.js'
import multer from "multer";
const routes =Router();

const storage1=multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/vendor/logobanner/'); // Folder for storing uploaded files
    },
    filename: (req, file, cb) => {
        const uniqueSuffix =Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
})
const upload1 = multer({ storage:storage1 });

const multipleupload1 = upload1.fields([{ name: 'logo',maxCount: 1  }, { name: 'banner',maxCount: 1  }]);


routes.get('/Details/:storeId',shopDetails);
routes.put('/Details/:vendorId',multipleupload1,editShopDetails)
routes.get('/allStores',allStores);
routes.get('/products/:vendorId',showProductsDetails)
routes.get('/products/cate/:categId/subcate/:subCateId',getProductCategoriesSubCate)



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


routes.post('/signup',multipleupload,signup);
routes.post('/otp/number',otpSend)

routes.post('/signup/verifyOTP',verifyOtpSignup)
routes.post('/otp/email', emailOTP)


export default routes;
