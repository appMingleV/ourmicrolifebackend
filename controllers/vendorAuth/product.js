
import pool from "../../config/db.js";


export const dimensionsProduct= async (req,res)=>{
    try{
      const {productId}=req.params;
      const {length,breadth,height,actual_weight,units}=req.body;
      const queryDimensions=`INSERT INTO dimension_of_products (product_id,length,breadth,height,volumetric_weight,actual_weight,units) VALUES (?,?,?,?,?,?,?)`;
      const volumetric_weight=(length*height*breadth)/5000;
      const value=[productId,length,breadth,height,volumetric_weight,actual_weight,units];
      const dimensionSet=await queryPromis(queryDimensions,value);      
      if(!dimensionSet){
        return res.status(400).json({
            status:"error",
            message:"Product dimension is not added",
        })
      }
      return res.status(200).json({
        status:"success",
        message:"Product dimension is added successfully",
        data:dimensionSet
      })
    }catch(err){
        return res.status(500).json({
            status:"error",
            message:"Something went wrong while trying to fetch product dimensions",
            error:err.message
        })
    }
}

 export const getDimensionProduct=async(req,res)=>{
    try{
        const {productId}=req.params;
        const queryDimension=`SELECT * FROM dimension_of_products WHERE product_id=?`;
        const value=[productId];
        const dimensionSet=await queryPromis(queryDimension,value);      
        if(dimensionSet.length==0){
            return res.status(404).json({
                status:"error",
                message:"Product dimension is not found",
            })
        }
        return res.status(200).json({
            status:"success",
            message:"Product dimension fetched successfully",
            data:dimensionSet
        })
    }catch(err){
        return res.status(500).json({
            status:"error",
            message:"Something went wrong while trying to fetch product dimensions",
            error:err.message
        })
    }
 }


 export const searchResult = async (req, res) => {
    try {
      
        const  searchTerm  = req.query.q;
       
        if (!searchTerm) {
            return res.status(400).json({
                status: "error",
                message: "search value is empty",
            })
        }
        const searchQuery = `
        SELECT * 
        FROM products 
        WHERE name REGEXP  ? OR description REGEXP  ? OR brand_name REGEXP ?
    `;

 
        
        const searchData = await queryPromis(searchQuery,[searchTerm,searchTerm,searchTerm]);
       
        if (searchData.length == 0) return res.status(400).json({
            status: "failed",
            message: "No products found matching the search term",
        })
        return res.status(200).json({
            status: "success",
            message: "Products fetched successfully",
            data: searchData,
        })

    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to search",
            error: err.message
        })
    }
}




export const editProduct=async(req,res)=>{
    try {
        const { productId } = req.params;
        const {
          productName,
          description,
          quantity,
          coin,
          status,
          categoryId,
          subCategoryId,
          brandName,
          prices,
        } = req.body;
  
  
        // Update the product's basic info
        const updateProductQuery = `
          UPDATE products 
          SET name = ?, description = ?, quantity = ?, status = ?,  category_id = ?, sub_category_id = ?, 
              brand_name = ?, coin = ? 
          WHERE id = ?
        `;
        const updateProductValues = [
          productName,
          description,
          quantity,
          status,
          categoryId,
          subCategoryId,
          brandName,
          coin,
          productId,
        ];
        const updateProductResult = await queryPromis(updateProductQuery, updateProductValues);
       
        if (!updateProductResult) {
          return res.status(400).json({
            status: "error",
            message: "Product is not updated",
          });
        }
  
        // Update prices and configurations
        
        for (const price of prices) {
          console.log(price)
          await updatePriceAndImages(price);
        }
         
        return res.status(200).json({
          status: "success",
          message: "Product is updated successfully",
          data: updateProductResult,
        });
      } catch (err) {
        return res.status(500).json({
          status: "error",
          message: "Something went wrong while trying to edit the product",
          error: err.message,
        });
      }
    
}

const updatePriceAndImages = async (price) => {
  
    const priceId = price.id;
    const color = price.color_name;
   
     // Update price details
    const updatePriceQuery = `UPDATE product_prices SET color_name = ? WHERE id = ?`;
    const updatePriceValues = [color, priceId];
    const updatedPrice = await queryPromis(updatePriceQuery, updatePriceValues);
   
    if (!updatedPrice) {
      throw new Error("Price update failed");
    }
  
  
    // Insert images for this priceId

  
    // Update configurations for this price
    for (const config of price.configurations) {
     const updatedDataConfig= await updateConfigurations(config);
  
    }
  };
  
  // Update Configurations
  const updateConfigurations = async (config) => {
    const configId = config.id;
    const size = config.size;
    const mrp = config.old_price;
    const sellPrice =config.sale_price;
    const quantity = config.stock;
  
    const updateConfigQuery = `
      UPDATE product_configurations 
      SET size = ?, old_price = ?, sale_price = ?, stock = ? 
      WHERE id = ?
    `;
    const updateConfigValues = [size, mrp, sellPrice, quantity, configId];
  
    const updatedConfig = await queryPromis(updateConfigQuery, updateConfigValues);
  
    if (!updatedConfig) {
      throw new Error("Configuration update failed");
    }
    
  
    return updatedConfig;
  };
//promis for all query of sql-->
const queryPromis=(query,value=[])=>{
    return new Promise((resolve,reject)=>{
        pool.query(query,value,(err,result)=>{
            if(err) return reject(err);
            resolve(result);
        })
    })
}