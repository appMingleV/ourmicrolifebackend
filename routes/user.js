import {Router} from 'express';
import {getALLTotalCouponsTotalAmount,applyCouponsTotalAmount,getALLCategoryCoupons,applyCategoryCoupon,getALLSubCategoryCoupons,applySubCategoryCoupon} from '../controllers/adminController/couponsController.js'
import {searchResult,getSingleProduct,getAllProduct} from '../controllers/vendorAuth/product.js'
import {userProfileUpdate,getProfile,checkReferralActive,payMLMAmount,signupController,verifyOTP,verifyOtpNumber,getWalletTransactions,singleOrder,login,addBankDetails,getBankDetails,addKYCDocuments,getUserKYCDetails,addUPI,getUPI,nomineeDetails,getNomineeDetails,withdrawRequest,getAllTrasaction,getUPIdDetails,getPaymentMethods} from '../controllers/userController/userController.js'
import {refferalCreate} from '../controllers/refferalController/refferController.js'
import order from './order.js'
import multer from 'multer';

const routes=Router();





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

routes.post('/signup',signupController)
routes.post('/signup/verifyOTP',verifyOTP);
routes.post('/login',login)
routes.post('/verifyOTP',verifyOtpNumber);
routes.put('/profile/:userId',upload.single('profile_picture'),userProfileUpdate)
routes.get('/profile/:userId',getProfile)
.get('/referralActive/:userId',checkReferralActive)
.post('/mlmMembers/:userId',upload.single('transaction_image'),payMLMAmount)
.get('/walletTransactions/:userId',getWalletTransactions)
.get('/order/:orderId',singleOrder)
.post('/banks/:userId',addBankDetails)
.post('/kycDetails/:userId',upload.fields([
    {
        name:"addharFront",
        maxCount:1
    },
    {
        name:"addharBack",
        maxCount:1
    },
    ,
    {
        name:"pan",
        maxCount:1
    }
]),addKYCDocuments)
.post('/upi/:userId',addUPI)
.get('/KYCDetails/:userId',getUserKYCDetails)
.get('/upiDetails/:userId',getUPI)
.get('/banks/:userId',getBankDetails)
.get('/upi/:userId',getUPIdDetails)
.get('/allProduct',getAllProduct)
.get('/paymentsMethod/:userId',getPaymentMethods)
.post('/nomineeDetails/:userId',upload.fields([{
    name:"addharFront",
    maxCount:1
},{
    name:"addharBack",
    maxCount:1
},{
    name:"pan",
    maxCount:1
}]),nomineeDetails)
.get('/nomineeDetails/:userId',getNomineeDetails)
.get('/singleProduct/:productId',getSingleProduct)
.post('/withdraw/:userId',withdrawRequest)
.get('/allWithdraw/transaction/:userId',getAllTrasaction)

.use('/order',order);


export default routes;