import pool from "../../config/db.js";


//add category
export const addCategory = (req, res) => {
    try {
        const { categorie_name } = req.body;

        const queryCategory = `INSERT INTO categories (image,categorie_name) values (?,?)`;
        const value = [req.file.filename, categorie_name];

        pool.query(queryCategory, value, (err, result) => {
            if (err) {
                return res.status(500).json({
                    status: "error",
                    message: "Something went wrong while trying to add category",
                    error: err.message
                })
            }
            return res.status(200).json({
                status: "success",
                message: "Category added successfully"
            })
        })
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to add category",
            error: err.message
        })
    }
}

//edit category
export const editCategory = (req, res) => {
    try {
        const { categoryId } = req.params;
        const { categorie_name } = req.body;
    
        if (categorie_name !== undefined && req.file === undefined) {
            // Update only the category name
            console.log(categorie_name);
            const queryCategoryName = `UPDATE categories SET categorie_name=? WHERE id=?`;
            const value = [categorie_name, categoryId];
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
                    message: "Category name updated successfully",
                    data: result,
                });
            });
        } else if (categorie_name === undefined && req.file !== undefined) {
            // Update only the category image
            const queryCategoryImage = `UPDATE categories SET image=? WHERE id=?`;
            const value = [req.file.filename, categoryId];
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
                    data: result,
                });
            });
        } else if (categorie_name !== undefined && req.file !== undefined) {
            // Update both category name and image
            const queryCategoryBoth = `UPDATE categories SET categorie_name=?, image=? WHERE id=?`;
            const value = [categorie_name, req.file.filename, categoryId];
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
                    data: result,
                });
            });
        }
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to edit category",
            error: err.message,
        });
    }
    
}

//delete category
export const deleteCategory = (req, res) => {
   try{
     const {categoryId}=req.params;
     const queryCategoryDelete=`DELETE FROM categories WHERE id=?`;
     pool.query(queryCategoryDelete,[categoryId],(err,result)=>{
        if(err){
            return res.status(500).json({
                status:"error",
                message:"Something went wrong while trying to delete category",
                error:err.message
            })
        }
        return res.status(200).json({
            status:"success",
            message:"Category deleted successfully"
        })
     })
   }catch{
          return res.status(500).json({
            status:"error",
            message:"Something went wrong while trying to delete category",
            error:err.message
        })
   }
}



//get single category

export const singleCategory=(req,res)=>{
try{
    const {categoryId}=req.params;
    const queryCategory=`SELECT * FROM categories WHERE id=?`;
    console.log("get single category")
    pool.query(queryCategory,[categoryId],(err,result)=>{
        if(err){
            return res.status(500).json({
                status:"error",
                message:"Something went wrong while trying to fetch category",
                error:err.message
            })
        }
        if(result.length===0){
            return res.status(404).json({
                status:"error",
                message:"Category not found"
            })
        }
        return res.status(200).json({
            status:"success",
            message:"Category fetched successfully",
            data:result[0]
        })
    })
}catch(err){
    return res.status(500).json({
        status:"error",
        message:"Something went wrong while trying to fetch category",
        error:err.message
    })
}
}



//get All Categories
export const getAllCategories = (req,res)=>{
    try{
    const queryCategory=`SELECT * FROM categories`;
    pool.query(queryCategory,(err,result)=>{
        if(err){
            return res.status(500).json({
                status:"error",
                message:"Something went wrong while trying to fetch all categories",
                error:err.message
            })
        }
        return res.status(200).json({
            status:"success",
            message:"All categories fetched successfully",
            data:result
        })
    })

    }catch(err){
        return res.status(500).json({
            status:"error",
            message:"Something went wrong while trying to fetch all categories",
            error:err.message
        })
    }
}