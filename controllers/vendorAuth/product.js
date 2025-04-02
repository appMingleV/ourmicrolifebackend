
import { error } from "console";
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
        for(let key of searchData) {
          const queryConfig=`SELECT * FROM product_configurations WHERE products=?`
        
           const dataConfig=await queryPromis(queryConfig,[key.id]);
           console.log(dataConfig);
           key.config=dataConfig;
        }
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

export const addProduct=async(req,res)=>{
  try
  {
    console.log("add product is ==================  ")
    const { vendorId } = req.params;
    let {
      name,
      description,
      quantity,
      coin,
      status,
      category_id,
      sub_category_id,
      brandName,
      prices,
    } = req.body;
   

    const queryAddProduct = `INSERT INTO products (vendor_id, name,featured_image,description, quantity, coin, status, category_id, sub_category_id, brand_name)
      VALUES (?,?,?,?,?,?,?,?,?,?)
    `;

    const values = [vendorId, name,`${req?.files?.featured_image[0]?.filename}`,description, quantity,coin, status, category_id, sub_category_id, brandName];
    const productSet = await queryPromis(queryAddProduct, values);
           console.log("images ======================",req?.files?.featured_image[0]?.filename)
    const productId=productSet?.insertId
   
    prices=JSON.parse(prices)
    let imageProduct= req?.files?.images;
    let count=0;
    console.log("images done is=====================>     ",imageProduct)
    for(let price of prices){
      const queryAddProduct=`INSERT INTO product_prices  (color_name,config1,product_id) VALUES (?,?,?)`
      const values = [price?.color_name,price?.config1 || "null",productId];
      const dataAddProducts=await queryPromis(queryAddProduct, values);
      for(let i=0;i<5 && count<imageProduct.length;i++){
      const queryAddProductPriceConfig=`INSERT INTO product_price_images (product_price_id, image_path) VALUES (?,?)`
      const valuesImagesConfig = [dataAddProducts?.insertId,`https://api.ourmicrolife.com/uploads/product/${imageProduct[count]?.filename}`];
       const dataAddImagesConfig=await queryPromis(queryAddProductPriceConfig, valuesImagesConfig);
      count++;
      }
     
      for (const config of price?.configuration) {
        const updatedDataConfig= await addConfigurations(config,dataAddProducts?.insertId);
       }
    }
    return res.status(201).json({
       status: "success",
            message: "Products  successfully added",
            productId: productId,
    })


  }catch(err){
    return res.status(500).json({
        status:"error",
        message:"Something went wrong while trying to add product",
        error:err.message
    })
  }
}
 const addConfigurations=async(config,productId)=>{
  const configId = config.name;
  const size = config.size;
  const old_price = config.old_price;
  const sellPrice =config.sale_price;
  const quantity = config.stock;

  const updateConfigQuery = `
    INSERT INTO product_configurations 
     (products,size, old_price, sale_price, stock,config2) 
    VALUES (?,?,?,?,?,?)
  `;
  const updateConfigValues = [productId,size, old_price, sellPrice, quantity, configId || null];

  const updatedConfig = await queryPromis(updateConfigQuery, updateConfigValues);

  if (!updatedConfig) {
    throw new Error("Configuration update failed");
  }
  

  return updatedConfig;
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
  
        console.log("files are  ",req.files);
        // Update the product's basic info
        const updateProductQuery = `
          UPDATE products 
          SET name = ?,  description = ?, quantity = ?, status = ?,  category_id = ?, sub_category_id = ?, 
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
    const updatePriceQuery = `UPDATE product_prices SET color_name=?,config1=? WHERE id = ?`;
    const updatePriceValues = [color, priceId];
    const updatedPrice = await queryPromis(updatePriceQuery, updatePriceValues);
    for(let i of price.images){
      console.log("======================price      ",i);
    const updateImagePrices=`UPDATE product_price_images SET image_path=? WHERE id = ?`
    const valueImage=[price]
    }
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
      SET size = ?, old_price = ?, sale_price = ?, stock = ?,config2=? 
      WHERE id = ?
    `;
    const updateConfigValues = [size, mrp, sellPrice, quantity, configId];
  
    const updatedConfig = await queryPromis(updateConfigQuery, updateConfigValues);
  
    if (!updatedConfig) {
      throw new Error("Configuration update failed");
    }
    
  
    return updatedConfig;
  };

  export const deleteProduct=async (req,res)=>{
           try{
                const {productId}=req.params;
                const queryDeleteProduct=`DELETE FROM products WHERE id=?`;
                const value=[productId];
                const deleteProductSet=await queryPromis(queryDeleteProduct,value);      
                if(!deleteProductSet){
                    return res.status(404).json({
                        status:"error",
                        message:"Product is not found",
                    })
                }
                return res.status(200).json({
                    status:"success",
                    message:"Product is deleted successfully",
                    data:deleteProductSet
                })
  
           }catch(err){
            return res.status(500).json({
                status:"error",
                message:"Something went wrong while trying to delete product",
                error:err.message
            })
 
           }
  }
export const getSingleProduct=async(req,res)=>{
      try{   
          const {productId}=req.params;
          const queryProducts=`SELECT * FROM products WHERE id=?`
          const dateProduct=await queryPromis(queryProducts,[productId]);
          
          const queryProductPrice=`SELECT * FROM product_prices WHERE product_id=?`
          const dateProductPrice=await queryPromis(queryProductPrice,[productId]);
         
          const priceArray=[]
          let prices={};
          for(let i=0;i<dateProductPrice.length;i++){
            const id=dateProductPrice[i]?.id;
           
            prices=dateProductPrice[i];
               
            const queryProductImage=`SELECT * FROM  product_price_images WHERE product_price_id=?`
            const dataProductImage=await queryPromis(queryProductImage,[id]);
         
            prices.images=dataProductImage;
            const queryOfConfiguration=`SELECT * FROM product_configurations WHERE products=?`
            const dataConfiguration=await queryPromis(queryOfConfiguration,[id]);
            prices.config=dataConfiguration;
            priceArray.push(prices);
          }
         
          dateProduct[0].prices=priceArray;
          return res.status(200).json({
            status:"sucessfully",
            data:dateProduct,
          })
 
      }catch(err){
        return res.status(500).json({
          status:"error",
          message:"omething went wrong while trying to single product",
          error:err.message
      })
      }
}
export const getAllProductVendor=async(req,res)=>{
  try{
    const {vendorId}=req.params;
    const queryAllProducts=`SELECT * FROM products WHERE vendor_id=?`
    const value=[vendorId];
    const dataProduct=await queryPromis(queryAllProducts,value);
    return  res.status(200).json({
      status:"success",
      message:"All product fetch successfully",
      data:dataProduct
    })
  
  }catch(err){
    return res.status(500).json({
      status:"error",
      message:"Something went wrong while trying to get all product",
      error:err.message
    })
  }
}
// export const getSingleProductVendor=async(req,res)=>{
//   try{
//     const {productId,vendorId}=req.params;
//     const queryProductData=`SELECT * FROM products WHERE vendor_id=? AND id=?`
//     const value=[vendorId,productId];
//     const dataProduct=await queryPromis(queryProductData,value);
    

//   }catch(err){
//     return res.status(500).json({
//       status:"error",
//       message:"Something went wrong while trying to get product",
//       error:err.message
//     })
//   }
// }
//promis for all query of sql-->
const queryPromis=(query,value=[])=>{
    return new Promise((resolve,reject)=>{
        pool.query(query,value,(err,result)=>{
            if(err) return reject(err);
            resolve(result);
        })
    })
}