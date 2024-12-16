import pool from "../../config/db.js";
export const addSubCategory = (req, res) => {
    try {

        const { sub_category_name, category_id } = req.body;
        console.log(sub_category_name, category_id);
      
        if (req.file == undefined) {
            return res.status(200).json({
                status: "error",
                message: "Please provide image",
                error: err.message
            })
        } else if (sub_category_name == undefined) {
            return res.status(200).json({
                status: "error",
                message: "Please provide sub_category_name",
                error: err.message
            })
        } else if (category_id == undefined) {
            return res.status(200).json({
                status: "error",
                message: "Please provide category_id",
                error: err.message
            })
        }

        const queryAddSubCategory = `INSERT INTO sub_categories (sub_category_name,image,category_id) VALUES (?,?,?)`;
        const values = [sub_category_name, req.file.filename, category_id];
        pool.query(queryAddSubCategory, values, (err, result) => {
            if (err) {
                return res.status(500).json({
                    status: "error",
                    message: "Something went wrong while adding subcategory",
                    error: err.message
                })
            }
            console.log(result);

            return res.status(200).json({
                status: "success",
                message: "Subcategory added successfully",
                subCategoryId:result.insertId
            })
        })
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while adding subcategory",
            error: err
        })
    }
}


export const editSubCategory = (req, res) => {
    try {
        const { subCategoryId } = req.params;
        const { sub_category_name, category_id } = req.body;
        const queryCheckcategroie = `SELECT * FROM sub_categories WHERE id=?`

        pool.query(queryCheckcategroie, [subCategoryId], (err, result) => {
            if (err) {
                return res.status(500).json({
                    status: "error",
                    message: "Something went wrong while trying to fetch category id",
                    error: err.message
                })
            }
            console.log(result);
            if (result.length == 0) {
                return res.status(400).json({
                    status: "failed",
                    message: "category not found"
                })
            }
            if (result[0].category_id != category_id) return res.status(400).json({
                status: "failed",
                message: "Subcategory category id does not match with the provided category id"
            })
            if (sub_category_name !== undefined && req.file === undefined) {
                // Update only the category name
                console.log("sub category i",sub_category_name)
                const queryCategoryName = `UPDATE sub_categories SET sub_category_name=? WHERE id=?`;
                const value = [sub_category_name, subCategoryId];
                pool.query(queryCategoryName, value, (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            status: "error",
                            message: "Something went wrong while trying to edit category name",
                            error: err.message,
                        });
                    }
                    return res.status(200).json({
                        status: "success",
                        message: "Sub Category name updated successfully",
                    
                    });
                });
            } else if (sub_category_name === undefined && req.file !== undefined) {
                // Update only the category image
                
                const queryCategoryImage = `UPDATE sub_categories SET image=? WHERE id=?`;
                const value = [req.file.filename, subCategoryId];
                pool.query(queryCategoryImage, value, (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            status: "error",
                            message: "Something went wrong while trying to edit category image",
                            error: err.message,
                        });
                    }
                    return res.status(200).json({
                        status: "success",
                        message: "Category image updated successfully",
                       
                    });
                });
            } else if (sub_category_name !== undefined && req.file !== undefined) {
                // Update both category name and image
                const queryCategoryBoth = `UPDATE sub_categories SET sub_category_name=?, image=? WHERE id=?`;
                const value = [sub_category_name, req.file.filename, subCategoryId];
                pool.query(queryCategoryBoth, value, (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            status: "error",
                            message: "Something went wrong while trying to edit category image and name",
                            error: err.message,
                        });
                    }
                    return res.status(200).json({
                        status: "success",
                        message: "Category name and image updated successfully",
               
                    });
                });
            }
        })
       
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to edit category",
            error: err.message,
        });
    }

}




//delete subCategory-->
export const deleteSubCategory = (req, res) => {
    try{
      const {subcategoryId}=req.params;
      const querySubCategoryDelete=`DELETE FROM sub_categories WHERE id=?`;
      pool.query(querySubCategoryDelete,[subcategoryId],(err,result)=>{
         if(err){
             return res.status(500).json({
                 status:"error",
                 message:"Something went wrong while trying to delete sub category",
                 error:err.message
             })
         }
         if(result.length===0)return res.status(400).json({
            status:"failed",
            message:"Sub Category  is not found"
         })
         return res.status(200).json({
             status:"success",
             message:" Sub Category deleted successfully"
         })
      })
    }catch{
           return res.status(500).json({
             status:"error",
             message:"Something went wrong while trying to delete sub category",
             error:err.message
         })
    }
 }
 

 //get single sub category

 export const singleSubCategory=(req,res)=>{
    try{
        const {subcategoryId}=req.params;
        const queryCategory=`SELECT * FROM sub_categories WHERE id=?`;
        console.log("get single category")
        pool.query(queryCategory,[subcategoryId],(err,result)=>{
            if(err){
                return res.status(500).json({
                    status:"error",
                    message:"Something went wrong while trying to fetch sub category",
                    error:err.message
                })
            }
            if(result.length===0){
                return res.status(404).json({
                    status:"error",
                    message:"Sub Category not found"
                })
            }
            return res.status(200).json({
                status:"success",
                message:" Sub Category fetched successfully",
                data:result[0]
            })
        })
    }catch(err){
        return res.status(500).json({
            status:"error",
            message:"Something went wrong while trying to fetch sub category",
            error:err.message
        })
    }
    }
    


    export const getAllSubCategories = (req,res)=>{
        try{
        const queryCategory=`SELECT * FROM sub_categories`;
        pool.query(queryCategory,(err,result)=>{
            if(err){
                return res.status(500).json({
                    status:"error",
                    message:"Something went wrong while trying to fetch all sub categories",
                    error:err.message
                })
            }
            return res.status(200).json({
                status:"success",
                message:"All Sub categories fetched successfully",
                data:result
            })
        })
    
        }catch(err){
            return res.status(500).json({
                status:"error",
                message:"Something went wrong while trying to fetch all sub categories",
                error:err.message
            })
        }
    }

export const subCategeriesByCategories=(req,res)=>{
    try{
        const {categoryId}=req.params;
        const querysubCategeriesByCategories=`SELECT * FROM sub_categories WHERE category_id=?`;
        const value=[categoryId];
        pool.query(querysubCategeriesByCategories,value,(err,result)=>{
            if(err){
                return res.status(500).json({
                    status:"error",
                    message:"Something went wrong while trying to fetch sub categories by category",
                    error:err.message
                })
            }
            if(result.length===0)return  res.status(400).json({
                status:"failed",
                message:"No sub categories found for this category"
 
            })
            return res.status(200).json({
                status:"success",
                message:"Sub categories fetched successfully by category",
                data:result
            })
        });

    }catch(err){
            return res.status(500).json({
                status:"error",
                message:"Something went wrong while trying to fetch all sub categories",
                error:err.message
            })
    }
}