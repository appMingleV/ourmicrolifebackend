import {Router} from 'express';
import {getALLTotalCouponsTotalAmount,applyCouponsTotalAmount,getALLCategoryCoupons,applyCategoryCoupon,getALLSubCategoryCoupons,applySubCategoryCoupon} from '../controllers/adminController/couponsController.js'
import {searchResult} from '../controllers/vendorAuth/product.js'
import {userProfileUpdate,getProfile} from '../controllers/userController/userController.js'
import multer from 'multer';
const routes=Router();


//user otp system-->
routes.post('')


//total amount of routes-->
routes.get('/totalAmount/allCoupons',getALLTotalCouponsTotalAmount)
routes.post('/totalAmount/applyCoupons',applyCouponsTotalAmount)

//category coupon routes--->
routes.get('/all/coupons/category/:categoryId',getALLCategoryCoupons);
routes.post('/applyCoupons/category/:categoryId',applyCategoryCoupon);

//category coupon routes-->
routes.get('/all/coupons/category/:categoryId/subcategory/:subCategoryId',getALLSubCategoryCoupons);
routes.post('/applyCoupons/category/:categoryId/subcategory/:subCategoryId',applySubCategoryCoupon);

routes.get('/search',searchResult);

const storage=multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/userProfile/');
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
})

const upload=multer({ storage: storage });


routes.put('/profile/:userId',upload.single('profile_picture'),userProfileUpdate)
routes.get('/profile/:userId',getProfile)

export default routes;