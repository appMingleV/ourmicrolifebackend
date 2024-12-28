import { Router } from "express";
import {addCouponTotalAmount,deleteCouponTotalAmount,addCategoryCoupon,deleteCategoryCoupon,addSubCategoryCoupon,deleteSubCategoryCoupon} from '../controllers/adminController/couponsController.js'
const routes=Router();

//total amount of routes-->
routes.post('/totalAmount',addCouponTotalAmount);
routes.delete('/totalAmount/:couponId',deleteCouponTotalAmount)



//category Coupons of routes-->
routes.post('/category/:categoryId',addCategoryCoupon);
routes.delete('/category/:couponId',deleteCategoryCoupon)


//sub category Coupons of routes-->;
routes.post('/category/:categoryId/subcategory/:subCategoryId',addSubCategoryCoupon);
routes.delete('/category/subcategory/:couponId',deleteSubCategoryCoupon);



export default routes;