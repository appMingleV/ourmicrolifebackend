import pool from '../../config/db.js';

export const getCoins=(req,res)=>{
    const {userId}=req.params;
    try{
      const queryCoin=`Select value from coins where user_id=${userId}`;
      pool.query(queryCoin,(err,result)=>{
        if(err)return res.status(500).json({
            status:"failed",
            message:"operation failed"
        })

        return res.status(200).json({
            status:"success",
            message:"operation successful",
            Data:{
              userId,
              coinsValue:result[0].value
            }
        })
      })
    }catch(err){
      return  res.status(500).json({
        status:"failed",
        message:"operation failed"
      })
    }
}