import { Router } from "express";

import {addCategory,editCategory,deleteCategory,singleCategory,getAllCategories} from '../controllers/adminController/categoryContoller.js'
import {vedorList,singleVendor,vedorChangeStatus} from '../controllers/adminController/adminController.js'
import {addSubCategory,editSubCategory,deleteSubCategory,singleSubCategory,getAllSubCategories,subCategeriesByCategories} from '../controllers/adminController/subcategoryController.js'
import {directReferralAddCoins,getDirectReferal} from '../controllers/adminController/referralManagment.js';
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



routes.post('/direct-referral/coin',directReferralAddCoins)
routes.get('/direct-referral/coin',getDirectReferal)

export default routes;