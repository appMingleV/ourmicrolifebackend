
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
           
           const queryProductPrice=`SELECT * FROM  product_prices WHERE product_id=?`
           const dataPrice=await queryPromis(queryProductPrice,[key?.id]);
           const prices=[];
        
          
           for(let i of dataPrice){
              i.config=[]
              const queryConfig=`SELECT * FROM product_configurations WHERE products=?`
              
           const dataConfig=await queryPromis(queryConfig,[i.id]);
          //  console.log("==============>      ",dataConfig)
           i.config.push(dataConfig);
           prices.push(i);
           }
          
           key.price=prices
          //  key.config=dataConfig;
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

export const addProduct = async (req, res) => {
  try {
    const { vendorId } = req.params;
    let { name, description, quantity, coin, status, category_id, sub_category_id, brand_name, prices } = req.body;
    
    const featuredImage = req?.files?.[0]?.filename || "";
    let images=[];
  
    for(let i=1;i<req?.files.length;i++){
     
        let indexPrice=+req?.files[i]?.fieldname
       
         if(!images[indexPrice]){
           images[indexPrice]=[req.files[i]?.filename]; 
        }else{
        images[indexPrice].push(req.files[i]?.filename)
        }
         
        }
    //  console.log("images ===========>     ",images)
    // Insert product details
    const productQuery = `INSERT INTO products (vendor_id, name, featured_image, description, quantity, coin, status, category_id, sub_category_id, brand_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const productValues = [vendorId, name, featuredImage, description, quantity, coin, status, category_id, sub_category_id, brand_name];
    const productResult = await queryPromis(productQuery, productValues);
    
    const productId = productResult?.insertId;
    if (!productId) throw new Error("Failed to insert product");
    
    prices = JSON.parse(prices);

    for (let i=0;i<prices.length;i++) {
      const {  config1,configValue ,configuration } = prices[i];
      
      // Insert product price
      const priceQuery = `INSERT INTO product_prices (color_name, config1, product_id) VALUES (?, ?, ?)`;
      const priceValues = [configValue, config1, productId];
      const priceResult = await queryPromis(priceQuery, priceValues);
      
      const priceId = priceResult?.insertId;
      if (!priceId) throw new Error("Failed to insert product price");
      
      // Insert images for each product price
      if(images[i]){
      for (const image of images[i]) {
        const imageQuery = `INSERT INTO product_price_images (product_price_id, image_path) VALUES (?, ?)`;
        const imageValues = [priceId, image];
        await queryPromis(imageQuery, imageValues);
      }
    }
      
      // Insert configurations
      for (const config of configuration || []) {
        await addConfigurations(config, priceId);
      }
    }
    
    return res.status(201).json({
      status: "success",
      message: "Product successfully added",
      productId
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Something went wrong while adding the product",
      error: err.message
    });
  }
};

const addConfigurations = async (config, productId) => {
  const { configId, configIdValue, old_price, sale_price, stock,pices,discount } = config;

  const configQuery = `INSERT INTO product_configurations (products, size, old_price, sale_price, stock, config2,pices,discount) VALUES (?, ?, ?, ?, ?, ?,?,?)`;
  const configValues = [productId, configIdValue, old_price, sale_price, stock, configId || null,pices,discount];
  
  const result = await queryPromis(configQuery, configValues);
  if (!result) throw new Error("Configuration insertion failed");
  return result;
};

export const editProduct=async(req,res)=>{
    try {
        const { productId } = req.params;
        let {
          name,
          description,
          quantity,
          coin,
          status,
          category_id,
          sub_category_id,
          brand_name,
          featured_image,
          prices,
        } = req.body;
      prices = JSON.parse(prices);
    
      let index=req?.files?.[0]?.fieldname==="featured_image"?1:0
      const featuredImage = index-1==0?req?.files?.[0]?.filename:featured_image;
      let images=new Array(prices.length);
      
       for(let i=index;i<req?.files.length;i++){
        let indexPrice=+req?.files[i]?.fieldname
         if(!images[indexPrice]){
           images[indexPrice]=[req.files[i]?.filename]; 
        }else{
        images[indexPrice].push(req.files[i]?.filename)
        }
        }
        
        // Update the product's basic info
        const updateProductQuery = `
          UPDATE products 
          SET name = ?,  description = ?, quantity = ?, status = ?,  category_id = ?, sub_category_id = ?, 
              brand_name = ?, coin = ? ,featured_image=?
          WHERE id = ?
        `;
        const updateProductValues = [
          name,
          description,
          quantity,
          status,
          category_id,
          sub_category_id,
          brand_name,
          coin,
          featuredImage,
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
        for (let i=0;i<prices.length;i++) {
          console.log(prices[i]);
          await updatePriceAndImages(i,prices[i],images,productId);
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

const updatePriceAndImages = async (i,price,images,productId) => {
  
    let priceId = price.id;
    const color = price.color_name;
    const congfig1=price.config1

    //find price
    const queryFindPrice=`SELECT * FROM product_prices WHERE id=?`
    const datePrice=await queryPromis(queryFindPrice,[priceId]);
     // Update price details
    if(datePrice.length>0){ 
      console.log("hello update ")
    const updatePriceQuery = `UPDATE product_prices SET color_name=?,config1=? WHERE id = ?`;
    const updatePriceValues = [color,congfig1, priceId];
  
    const updatedPrice = await queryPromis(updatePriceQuery, updatePriceValues);
    if (!updatedPrice) {
      throw new Error("Price update failed");
    }
    //insert images-->

    if(images[i]){
     for (const image of images[i]) {
        const imageQuery = `INSERT INTO product_price_images (product_price_id, image_path) VALUES (?, ?)`;
        const imageValues = [priceId, image];
        await queryPromis(imageQuery, imageValues);
      
      }
    }
    
    for (const config of price?.config) {
     const updatedDataConfig= await updateConfigurations(config,priceId);
    }
    return "done"
  }else{
        console.log("hello new addtion ")
      const {  config1,configValue ,configuration } = price;
      const priceQuery = `INSERT INTO product_prices (color_name, config1, product_id) VALUES (?, ?, ?)`;
      const priceValues = [color, config1, productId ];
      const priceResult = await queryPromis(priceQuery, priceValues);
      
     priceId = priceResult?.insertId;
      if (!priceId) throw new Error("Failed to insert product price");
      
      // Insert images for each product price
      if(images[i]){
      for (const image of images[i]) {
        const imageQuery = `INSERT INTO product_price_images (product_price_id, image_path) VALUES (?, ?)`;
        const imageValues = [priceId, image];
        await queryPromis(imageQuery, imageValues);
      }
  }
  for (const config of price?.config) {
  
     const updatedDataConfig= await updateConfigurations(config,priceId);
  
    }
    return "done"
}
  };
  
  // Update Configurations
 const updateConfigurations = async (config,priceId) => {
  const configId = config.id;
  const size = config.size;
  const mrp = config.old_price;
  const sellPrice = config.sale_price;
  const quantity = config.stock;
  const pices = config.pices;
  const config2 = config.config2;
  const discount = config.discount;
  const queryFindConfig=`SELECT * FROM product_configurations WHERE id=?`
  const dataConfig=await queryPromis(queryFindConfig,[configId]);
  if (dataConfig.length>0) {
    // Update existing configuration
    const updateConfigQuery = `
      UPDATE product_configurations 
      SET size = ?, old_price = ?, sale_price = ?, stock = ?, config2 = ?, pices = ?, discount = ? 
      WHERE id = ?
    `;
    const updateConfigValues = [size, mrp, sellPrice, quantity, config2, pices, discount, configId];

    const updatedConfig = await queryPromis(updateConfigQuery, updateConfigValues);

    if (!updatedConfig) {
      throw new Error("Configuration update failed");
    }

    return updatedConfig;
  } else {
    console.log("config")
    // Insert new configuration
    const insertConfigQuery = `
      INSERT INTO product_configurations (size,products, old_price, sale_price, stock, config2, pices, discount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const insertConfigValues = [size, priceId,mrp, sellPrice, quantity, config2, pices, discount];

    const insertedConfig = await queryPromis(insertConfigQuery, insertConfigValues);

    if (!insertedConfig) {
      throw new Error("Configuration insert failed");
    }

    return insertedConfig;
  }
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
          const categoryId=dateProduct[0].category_id
          const queryCategory=`SELECT * FROM  categories WHERE id=?`
          const dataCategory=await queryPromis(queryCategory,[categoryId]);
          
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
          dateProduct[0].categoryDetail=dataCategory;
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
export const getAllProduct=async(req,res)=>{
  try{
    const queryAllProduct=`SELECT * FROM products`;
    const dataAllProducts=await queryPromis(queryAllProduct);
    let result=[]
    
    for(let i=0;i<dataAllProducts.length;i++){
     const queryPrice=`SELECT id,color_name, config1 FROM  product_prices WHERE product_id=?`
     const dataProductPrice=await queryPromis(queryPrice,[dataAllProducts[i].id])
     let produtobj=dataAllProducts[i];
     for(let i of dataProductPrice){
      console.log(i);
      
     const queryConfig=`SELECT * FROM product_configurations WHERE products=?`
     const dataConfig=await queryPromis(queryConfig,[i?.id]);
     produtobj["prices"]=i;
     produtobj["config"]=dataConfig;
     }
     result.push(produtobj);
    }
    return res.status(200).json({
      status:"sucessfully",
      data:result
    })
  }catch(err){
    return res.status(500).json({
      status:"error",
      message:"Something went wrong while trying to get all product",
      error:err.message
    })
  }
}

export const delateConfigProduct=async(req,res)=>{
  try{
    const {configId}=req.params;
    const queryDelete=`DELETE FROM product_configurations WHERE id=?`
    const dataImage=await queryPromis(queryDelete,[configId]);
    return res.status(200).json({
      status:"sucessfully",
      message:"delete image sucessfully images"
    })
  }catch(err){
    return res.status(500).json({
      status:"error",
      message:"Something went wrong while trying to get all product",
      error:err.message
    })
  }
}

export const dashboardDetails=async(req,res)=>{
  try{
      const {vendorId}=req.params;
      
  }catch(err){
  return res.status(500).json({
      status:"error",
      message:"Something went wrong while trying to get all product",
      error:err.message
    })
  }
}

export const delatePriceProduct=async(req,res)=>{
  try{
    const {priceId}=req.params;
    const queryDelete=`DELETE FROM product_prices WHERE id=?`
    const dataImage=await queryPromis(queryDelete,[priceId]);
    return res.status(200).json({
      status:"sucessfully",
      message:"delete image sucessfully images"
    })
  }catch(err){
    return res.status(500).json({
      status:"error",
      message:"Something went wrong while trying to get all product",
      error:err.message
    })
  }
}
export const delateImage=async(req,res)=>{
  try{
    const {imageId}=req.params;
    const queryDelete=`DELETE FROM product_price_images WHERE id=?`
    const dataImage=await queryPromis(queryDelete,[imageId]);
    return res.status(200).json({
      status:"sucessfully",
      message:"delete image sucessfully images"
    })
  }catch(err){
    return res.status(500).json({
      status:"error",
      message:"Something went wrong while trying to get all product",
      error:err.message
    })
  }
}
const queryPromis=(query,value=[])=>{
    return new Promise((resolve,reject)=>{
        pool.query(query,value,(err,result)=>{
            if(err) return reject(err);
            resolve(result);
        })
    })
}