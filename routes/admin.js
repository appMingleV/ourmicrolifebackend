import { Router } from "express";

import {addCategory,editCategory,deleteCategory,singleCategory,getAllCategories} from '../controllers/adminController/categoryContoller.js'
import {vedorList,singleVendor,vedorChangeStatus,vendorOrderList,getMLMUser,upateMLMMemberStatus,getnewMLMUser,getBankDetails,getAllUserDetails,getSingleUser} from '../controllers/adminController/adminController.js'
import {addSubCategory,editSubCategory,deleteSubCategory,singleSubCategory,getAllSubCategories,subCategeriesByCategories} from '../controllers/adminController/subcategoryController.js'

import {compaignAdd,getCampaign,updateCampaign,deleteCampaign} from '../controllers/adminController/campaignController.js'
import {addSlider,allSlider,deleteSlider} from '../controllers/adminController/sliderController.js'
import {decryptRefferal} from '../middleware/index.js'
import {mlmLogin} from '../controllers/adminController/adminController.js'
import referral from './referral.js'
import coupons from './coupons.js'
import multer from "multer";


const routes=Router();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/categories/'); // Folder for storing uploaded files
    },
    filename: (req, file, cb) => {
        const uniqueSuffix ='category' +Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage });
const singleImage=upload.single('image');
routes.get('/',);
routes.post('/category',singleImage,addCategory);
routes.put('/category/:categoryId',singleImage,editCategory);
routes.get('/category/:categoryId',singleCategory);
routes.get('/category',getAllCategories);
routes.delete('/category/:categoryId',deleteCategory);




const storage1 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/categories/subcategories/'); // Folder for storing uploaded files
    },
    filename: (req, file, cb) => {
        const uniqueSuffix ='subCate' +Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload1 = multer({ storage:storage1 });
const singleImageSubCategory=upload1.single('image');
//sub categories CRUD--->
routes.post('/subcategory',singleImageSubCategory,addSubCategory);
routes.put('/subcategory/:subCategoryId',singleImageSubCategory,editSubCategory);
routes.get('/subcategory/:subcategoryId',singleSubCategory);
routes.get('/subcategory',getAllSubCategories);
routes.delete('/subategory/:subcategoryId',deleteSubCategory);
routes.get('/subategory/category/:categoryId',subCategeriesByCategories);

//vendor list-->
routes.get('/vendor/:query',vedorList)
routes.get('/vendorSingle/:vendorId',singleVendor)
routes.put('/vendorStatus/:vendorId',vedorChangeStatus)
routes.get('/vendor/:vendorId/order',vendorOrderList)
.post('/mlm/login',mlmLogin)






// campaign CRUD-->
const storage2=multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/campaign/'); // Folder for storing uploaded files
    },
    filename: (req, file, cb) => {
        const uniqueSuffix ='campaign' +Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
})

const upload2=multer({ storage:storage2 });
const campaignImage=upload2.single('image');
routes.post('/campaign/page/:page/location/:location',campaignImage,compaignAdd)
routes.put('/campaign/:campaignId',campaignImage,updateCampaign)
routes.delete('/campaign/:campaignId',deleteCampaign)
routes.get('/campaign/page/:page/location/:location',getCampaign)

//slider -->
const storage3=multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/sliders/'); // Folder for storing uploaded files
    },
    filename: (req, file, cb) => {
        const uniqueSuffix ='slider' +Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
})
const upload3=multer({storage:storage3});
const singleImage3=upload3.single('image');
routes.post('/sliders/:query',singleImage3,addSlider);
routes.get('/sliders/:query',allSlider);
routes.delete('/sliders/:sliderId',deleteSlider);
routes.get('/newMLMUser',getMLMUser)
.put('/statusMLM/:userId',decryptRefferal(),upateMLMMemberStatus)
.get('/mlmuser/:userId',getnewMLMUser)
.get('/userDetails/:userId',getSingleUser)
.get('/allUserDetails',getAllUserDetails)
.get('/banksdetails',getBankDetails)

routes.use('/referral',referral)
routes.use('/coupon',coupons)

export default routes;