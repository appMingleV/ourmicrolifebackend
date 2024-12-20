import pool from "../../config/db.js";

export const directReferralAddCoins=(req,res)=>{
    try{
     const {coin}=req.body;
     const queryCheckCoin=`SELECT * FROM direct_referral_coins`
     pool.query(queryCheckCoin,(err,result)=>{
        if(err){
            return res.status(500).json({
                status:"error",
                message:"Something went wrong while trying to check if direct referral coins table exists",
                error:err.message
            })
        }
        if(result.length==0){
            const qeuryPutDIRRefCoin=`INSERT INTO direct_referral_coins (coin,date) VALUES (?,?)`;
            const values=[coin,new Date()];
            pool.query(qeuryPutDIRRefCoin,values,(err,result)=>{
                if(err)return res.status(500).json({
                    status:"failed",
                    message:"An error occurred while trying to add coins to the user",
                    error:err.message
                })
                res.status(200).json({
                    status:"success",
                    message:"Coins added successfully to the Direct Referral coin",
                })
            });
         }else{
            const queryUpdateDirecRef=`UPDATE direct_referral_coins SET coin=? WHERE id=1`;
            const values=[coin];
            pool.query(queryUpdateDirecRef,values,(err,result)=>{
                if(err)return res.status(500).json({
                    status:"failed",
                    message:"An error occurred while trying to update Direct Referral coin",
                    error:err.message
                })
                res.status(200).json({
                    status:"success",
                    message:"Coins updated successfully to the Direct Referral coin",
                })
            })
         }
     })
   
    
    }catch(err){
        return res.status(500).json({
            status:"failed",
            message:"An error occurred while trying to add coins to the user",
            error:err.message
        })
    }
}


export const getDirectReferal=(req,res)=>{
    try{
       const queryGetDirRef=`SELECT * FROM direct_referral_coins`
       pool.query(queryGetDirRef,(err,result)=>{
            if(err){
                return res.status(500).json({
                    status:"error",
                    message:"Something went wrong while trying to fetch direct referral coins",
                    error:err.message
                })
            }
            res.status(200).json({
                status:"success",
                message:"Direct Referral coins fetched successfully",
                data:result
            })
       })

    }catch(err){
        return res.status(500).json({
            status:"failed",
            message:"An error occurred while trying to fetch direct referral coins",
            error:err.message
        })
    }
}