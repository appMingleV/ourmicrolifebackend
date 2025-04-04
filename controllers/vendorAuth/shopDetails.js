import pool from "../../config/db.js";

export const shopDetails = (req, res) => {
    try {
        console.log("getAll Stores")
        const { storeId } = req.params;
        const queryShopDetails = `SELECT storeName,userName,storeCategory,storeAddress,BusinessContact,logo,banner,vendor_id FROM vendorStoreDetails WHERE id=?`;
        const value = [storeId];
        pool.query(queryShopDetails, value, (err, result) => {
            if (err) {
                return res.status(500).json({
                    status: "error",
                    message: "Something went wrong while trying to fetch shop details",
                    error: err.message
                })
            }
            if (result.length == 0) return res.status(400).json({
                status: "failed",
                message: "No shop found for this vendor"
            })
            return res.status(200).json({
                status: "success",
                message: "Shop details fetched successfully",
                data: result[0]
            })
        })
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to fetch shop details",
            error: err.message
        })
    }
}

export const allStores=async (req,res)=>{
    console.log("getAll Stores")
    try{
      
      const queryAllShops=`SELECT id FROM Vendor WHERE status="Accept" `;
      const allDetails=await queryPromis(queryAllShops);
       
      if(allDetails.length==0)return res.status(200).json({
        status: "failed",
        message: "No stores found"
      })
      const shopDetailsObj=[];
      
      for(let key of allDetails) {
        const queryShopDetails=`SELECT * FROM vendorStoreDetails WHERE vendor_id=?`;
        const  value=[key.id];
        const shopDetails=await queryPromis(queryShopDetails,value);
        shopDetailsObj.push(shopDetails[0]);
      }


      return res.status(200).json({
        status: "success",
        message: "All stores fetched successfully",
        data: shopDetailsObj
      })
    }catch(err){
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to fetch all stores",
            error: err.message
        })
    }
}

export const editShopDetails = async(req, res) => {
    try {
        console.log("getAll Stores")
        const { vendorId } = req.params;
        const {businessContact, shopAddress } = req.body;
        const {logo,banner}=req.files
        //check existing vendor then
        const queryCheckUser=`SELECT CASE 
           WHEN EXISTS (SELECT 1 FROM Vendor WHERE id = ${vendorId}) THEN 'Present'
           ELSE 'Not Present'
       END AS status`
        const checkUser=await queryPromis(queryCheckUser,[vendorId]);
        if(checkUser[0].status==='Not Present')return res.status(404).json({
                status: "failed",
                message: "Vendor not found"
            })
        

        const queryEditShopDetails = `UPDATE vendorStoreDetails SET logo=?,banner=?,businessContact=?,storeAddress=? WHERE vendor_id=?`;
        const values = [logo[0].filename, banner[0].filename, businessContact, shopAddress, vendorId];
        const updateCheck=await queryPromis(queryEditShopDetails, values);

        if(updateCheck.affectedRows===0) return res.status(400).json({
                status: "failed",
                message: "No shop found for this vendor"
            })

        return res.status(200).json({
            status: "success",
            message: "Shop details edited successfully"
        })
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to edit shop details",
            error: err.message
        })
    }
}

export const getProductCategoriesSubCate=async(req,res)=>{
    try{
        console.log("getAll Stores product")
     const {categId,subCateId}=req.params;
     const queryProductDetails=`SELECT id,name,featured_image,description FROM products WHERE category_id=? AND sub_category_id=?`;
     const value=[categId,subCateId];
     const productData=await queryPromis(queryProductDetails,value);
     const getFullProductData=await getMinConfig(productData);
 
     return  res.status(200).json(
         {
             status:"success",
             message:"Products fetched successfully",
             data:getFullProductData
         })
    }catch(err){
     return  res.status(500).json({
         status:"error",
         message:"Something went wrong while trying to fetch product categories and subcategories",
         error:err.message
     })
    }
 }
 

 export const showProductsDetails = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const queryProductDetails = `SELECT id,name,featured_image,description FROM products WHERE vendor_id=?`;
        const value = [vendorId];
        const productData = await queryPromis(queryProductDetails, value);
        if (productData.length == 0) return res.status(200).json({
            status: "failed",
            message: "No products found"
        })
        
        const getFullProducts=await getMinConfig(productData);
        return res.status(200).json({
            status: "success",
            message: "Products fetched successfully",
            data: getFullProducts
        })
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to fetch product details",
            error: err.message
        })
    }
}
const queryPromis = (query, value = [])=>{
    return new Promise((resolve, reject) => {
        pool.query(query, value, (err, result) => {
            if (err) reject(err);
            resolve(result)
        })
    })
}



const getMinConfig=(productData)=>{
    return new Promise(async(resolve,reject)=>{
        for (let key of productData) {
            const queryProductDetails = `SELECT * FROM product_configurations WHERE sale_price = (SELECT MIN(sale_price) FROM product_configurations WHERE products=?); `
            const value=[key.id];
            const productConfig = await queryPromis(queryProductDetails, value);
             key.old_price=productConfig[0]?.old_price;
             key.sale_price=productConfig[0]?.sale_price;
        }
        resolve(productData);
    })
}

export const getAllOrders=async(req,res)=>{
    try{
        const {vendorId}=req.params;
        if(!vendorId)return res.status(404).json({
            status:"failed",
            message:"Vendor id not found"
        })
        const queryAllOrders=`SELECT * FROM order_items WHERE vendor_id=?`;
        const valueAllOrder=[vendorId]

        const allOrders=await queryPromis(queryAllOrders,valueAllOrder);
        if(allOrders.length===0) return res.status(200).json({
            status:"failed",
            message:"No orders found"
        })
        const arrayAllOrders=[];
        for(let key of allOrders){
            const queryOrderDetails=`SELECT * FROM orders_cart WHERE id=?`;
            const valueOrder=[key.order_id];
            const orderDetails=await queryPromis(queryOrderDetails,valueOrder);
            const queryProductDetails=`SELECT * FROM products WHERE id=?`;
            const valueProduct=[key.product_id];
            const productDetails=await queryPromis(queryProductDetails,valueProduct);
            const queryAddress=`SELECT * FROM shipping_addresses WHERE id=?`
            const valueAddress=[orderDetails[0].shipping_address_id];
            const addressDetails=await queryPromis(queryAddress,valueAddress);
            arrayAllOrders.push({...key,paymentStatus:orderDetails[0].payment_status,product_name:productDetails[0]?.name||"not found",addressDetails:addressDetails[0]||{}})
        }
        return res.status(200).json({
            status:"success",
            message:"All orders fetched successfully",
            data:arrayAllOrders
        })

    }catch(err){
        return res.status(500).json({
            status:"error",
            message:"Something went wrong while trying to fetch all orders",
            error:err.message
        })
    }
}



export const getSingleOrder=async(req,res)=>{
    try{
      const {orderId}=req.params;
      console.log("get single order")
      if(!orderId)return res.status(404).json({
        status:"failed",
        message:"Order id not found"
      })
      const queryAllOrders=`SELECT * FROM order_items WHERE id=?`;
      const valueAllOrder=[orderId]

      const allOrders=await queryPromis(queryAllOrders,valueAllOrder);
      console.log(allOrders)
      if(allOrders.length===0) return res.status(200).json({
          status:"failed",
          message:"No orders found"
      })
      const arrayAllOrders=[];
      for(let key of allOrders){
          const queryOrderDetails=`SELECT * FROM orders_cart WHERE id=?`;
          const valueOrder=[key.order_id];
          const orderDetails=await queryPromis(queryOrderDetails,valueOrder);
          const queryProductDetails=`SELECT * FROM products WHERE id=?`;
          const valueProduct=[key.product_id];
          const productDetails=await queryPromis(queryProductDetails,valueProduct);
          const queryAddress=`SELECT * FROM shipping_addresses WHERE id=?`
          const valueAddress=[orderDetails[0].shipping_address_id];
          const addressDetails=await queryPromis(queryAddress,valueAddress);
          console.log("================    ",orderDetails[0].payment_status)
          arrayAllOrders.push({...key,paymentStatus:orderDetails[0].payment_status,product_name:productDetails[0]?.name||"not found",addressDetails:addressDetails[0]||{}})
      }
      return res.status(200).json({
          status:"success",
          message:"All orders fetched successfully",
          data:arrayAllOrders
      })
    }catch(err){
        return res.status(500).json({
            status:"error",
            message:"Something went wrong while trying to fetch single order",
            error:err.message
        })
    }
}