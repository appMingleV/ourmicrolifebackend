

export const updateOrder=async(req,res)=>{
   try{
     const {userId}=req.params;
     const {status}=req.body;
     if(!userId ||!status){
        return res.status(400).json({
            status:"error",
            message:"userId and status are required"
        })
     }
     const queryUpdateOrder=`UPDATE orders_cart SET status=? WHERE user_id=?`;
     const value=[status,userId];
     const updateOrder=await queryPromise(queryUpdateOrder,value);
     if(!updateOrder){
        return res.status(404).json({
            status:"error",
            message:"No order found for user"
        })
     }
     if(status=="delivered"){
        
     }
     return res.status(200).json({
        status:"success",
        message:"Order status updated successfully"
     })
   }catch(err){
    return res.status(500).json({
        status:"failed",
        message:"Operation failed",
        error:err.message
    })
   }
}

export const orderDetails=async(req,res)=>{
   try{
      // const {}
   }catch(err){
      return res.status(500).json({
         status:"success",
         message: "Something went wrong while trying to delete coupon",
         error: err.message
      })
   }
}