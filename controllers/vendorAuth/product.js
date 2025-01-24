
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

 
        
        const searchData = await queryPromise(searchQuery,[searchTerm,searchTerm,searchTerm]);
       
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
    try{
        console.log("prices is ")
        const {productId}=req.params;
        const {productName,description,quantity,thumnailImage,coin,status,categoryId,subCategoryId,brandName,prices}=req.body; 
        
        const updateProduct=`UPDATE products SET name=?,description=?,quantity=?,status=?,featured_image=?,category_id=?,sub_category_id=?,brand_name=?,coin=? WHERE id=?`
        const value=[productName,description,quantity,status,thumnailImage,categoryId,subCategoryId,brandName,coin,productId];
        const updateDataProduct=await queryPromis(updateProduct,value);
        console.log(prices,productName)
        if(!updateDataProduct){
            return res.status(400).json({
                status:"error",
                message:"Product is not updated",
            })
        }
        for(let key of prices){
            
        updatePriceAndConfig(key);
        }
        return res.status(200).json({
            status:"success",
            message:"Product is updated successfully",
            data:updateDataProduct
        })
    }catch(err){
        return res.status(500).json({
            status:"error",
            message:"Something went wrong while trying to edit product",
            error:err.message
        })
    }
}

async function updatePriceAndConfig(prices){
      const priceId=prices.pricesId
      const color=prices?.color;
      const updatePrice=`UPDATE product_prices SET color_name=? WHERE id=?`
      const value=[color,priceId];
      const updatedData=await queryPromis(updatePrice,value);
      if(!updatedData){
        return res.status(400).json({
            status:"error",
            message:"Price is not updated",
        })
      }
      const config=prices.configuration;
      for(let key of config){
        updateConfigurations(key);
      }
      
    }

   async function updateConfigurations(config){
            const configId=config.configurationId;
            const size=config.size;
            const mrp=config.mrp;
            const sellPrice=config.sellPrice;
            const quantity=config.quantity;
            const updateConfig=`UPDATE product_configurations SET size=?, old_price=?,sale_price=?, stock=? WHERE id=?`
            const value=[size,mrp,sellPrice,quantity,configId]

            const dataUpateConfig=await queryPromis(updateConfig,value);
            if(!dataUpateConfig){
                return res.status(400).json({
                    status:"error",
                    message:"Configuration is not updated",
                })
            }
            return dataUpateConfig;
    }
//promis for all query of sql-->
const queryPromis=(query,value=[])=>{
    return new Promise((resolve,reject)=>{
        pool.query(query,value,(err,result)=>{
            if(err) return reject(err);
            resolve(result);
        })
    })
}