
import pool from "../../config/db.js"

export const buyOrders=async(req,res)=>{
    try{
        const {coin,color,products,size,product_configuration_id,old_price,price,quantity,product_name,user_id,image_url}=req.body
        if(!req?.file && !coin && !product_configuration_id && !color && !products && !product_name && !old_price && !price && !user_id && !image_url){
            return res.status(400).json({
                status:"error",
                message:"Missing required fields"
            })
        }
    
        const queryBuyOrder=`INSERT INTO buyorder (user_id,coin,color,products,size,product_configuration_id,old_price,price,quantity,product_name,image_url) VALUES (?,?,?,?,?,?,?,?,?,?,?)`
        const values=[user_id,coin,color,products,size,product_configuration_id,old_price,price,quantity,product_name,image_url]
        
        const dataBuyOrder=await queryPromis(queryBuyOrder,values);
        if(!dataBuyOrder) return res.status(400).json({
            status:"error",
            message:"Failed to add buy order"
        })
    
    return  res.status(200).json({
        status:"success",
        message:"Fetched buy orders successfully",
        data:dataBuyOrder
    })

    }catch(err){
        return res.status(500).json({
            status:"error",
            message:"Something went wrong while trying to fetch buy orders",
            error:err.message
        })
    }
}



export const getBuyOrder=async(req,res)=>{
    try{
        const {buyId}=req.params;
        if(!buyId){
            return res.status(400).json({
                status:"error",
                message:"id cannot be null"
            })  
        }
        const queryGetBuyOrder=`SELECT * FROM buyorder WHERE id=?`;
        const value=[buyId];
        const dataBuyOrder=await queryPromis(queryGetBuyOrder,value);
        if(!dataBuyOrder) return res.status(404).json({
            status:"error",
            message:"Buy order not found"
        })
          return res.status(200).json({
            status:"success",
            message:"Fetched buy order successfully",
            data:dataBuyOrder
        })
    }catch(err){
        return res.status(500).json({
            status:"error",
            message:"Something went wrong while trying to fetch buy order",
            error:err.message
        })
    }
}
// coin
// : 
// 4
// color
// : 
// "gray"
// id
// : 
// 388
// image
// : 
// null
// old_price
// : 
// "78999.00"
// price
// : 
// "59899.00"
// product_configuration_id
// : 
// 67
// product_name
// : 
// "OPPO Find X8 5G ( 256 GB Storage, 12 GB RAM )"
// products
// : 
// 144
// quantity
// : 
// 1
// size
// : 
// "12+256GB"
// user_id
// : 
// 210
// vendor_id
// : 
// 94


const queryPromis=(query,value=[])=>{
     return new Promise((resolve,reject)=>{
        pool.query(query,value,(err,result)=>{
            if(err){
                reject(err)
            };
            resolve(result);
        })
     })
}