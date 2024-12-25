

import pool from "../../config/db.js";


export const directReferralAddCoins=async(req,res)=>{
    try{
     const {coin}=req.body;
     const queryCheckCoin=`SELECT * FROM direct_referral_coins`
     pool.query(queryCheckCoin,async(err,result)=>{
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
       
            pool.query(qeuryPutDIRRefCoin,values,async(err,result)=>{
                if(err)return res.status(500).json({
                    status:"failed",
                    message:"An error occurred while trying to add coins to the user",
                    error:err.message
                })
                const queryAddLevle=`INSERT INTO team_referral_coin (level1) VALUES (?)`
                const value=[coin];
                const addCoinAtLevel1=await queryPromise(queryAddLevle,value);
                res.status(200).json({
                    status:"success",
                    message:"Coins added successfully to the Direct Referral coin",
                })
            });
         }else{
            const queryAddLevle=`UPDATE team_referral_coin SET level1=? WHERE id=2`
            const value=[coin];
            const addCoinAtLevel1=await queryPromise(queryAddLevle,value);
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


export const teamReferralManagement=async(req,res)=>{
      try{
        console.log(req.body)
        const queryDirectReferral=`SELECT * FROM direct_referral_coins`;
        const directReferralData=await queryPromise(queryDirectReferral);
        if(directReferralData.length==0){
            return res.status(400).json({
                status:"error",
                message:"you should be add coin in  direct referral",
            })
        }
        const queryCheckData=`SELECT * FROM team_referral_coin `;
        const DataTeamReferral=await queryPromise(queryCheckData);
        if(DataTeamReferral.length==0){
        const {level2,level3,level4,level5,level6,level7,level8,level9,level10,level11,level12,level13,level14}=req.body;
        const queryGetTeamRef=`INSERT INTO team_referral_coin (level1,level2,level3,level4,level5,level6,level7,level8,level9,level10,level11,level12,level13,level14) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
        const values=[directReferralData[0].coin,level2,level3,level4,level5,level6,level7,level8,level9,level10,level11,level12,level13,level14];
        
        const addTeamRefferals=await queryPromise(queryGetTeamRef,values);
        console.log(addTeamRefferals)
        if(addTeamRefferals.affectedRows==0){
            return res.status(400).json({
                status:"error",
                message:"Team referral coins are not added",
            })
        }
    
        return res.status(200).json({
            status:"success",
            message:"Team referral coins are added successfully",
            data:addTeamRefferals
        })
    }else{
        const {level2,level3,level4,level5,level6,level7,level8,level9,level10,level11,level12,level13,level14}=req.body;
        const queryUpdateTeamRef=`UPDATE team_referral_coin SET level1=?,level2=?,level3=?,level4=?,level5=?,level6=?,level7=?,level8=?,level9=?,level10=?,level11=?,level12=?,level13=?,level14=? WHERE id=2`;
        const values=[directReferralData[0].coin,level2,level3,level4,level5,level6,level7,level8,level9,level10,level11,level12,level13,level14];
        const updateValue=await queryPromise(queryUpdateTeamRef,values);
        if(updateValue.affectedRows==0){
            return res.status(400).json({
                status:"error",
                message:"Team referral coins are not updated",
            })
        }
        return res.status(200).json({
            status:"success",
            message:"Team referral coins are updated successfully",
            data:updateValue
        })
    }

      }catch(err){
        return res.status(500).json({
            status:"failed",
            message:"An error occurred while trying to fetch team referral coins",
            error:err.message
        })
      }

}

export const geTeamReferralCoin=async(req,res)=>{
    try{
     const getQueryData=`SELECT * FROM team_referral_coin  `;
     const dataTeamReferral=await queryPromise(getQueryData);
     if(dataTeamReferral.length==0){
        return res.status(200).json({
            status:"success",
            message:"No team referral coins found",
        })
     }
     return res.status(200).json({
        status:"success",
        message:"Team referral coins fetched successfully",
        data:dataTeamReferral[0]
     })

    }catch(err){
        return res.status(500).json({
            status:"failed",
            message:"An error occurred while trying to fetch team referral coins",
            error:err.message
        })
    }
}




export const addDirectPurchased=async(req,res)=>{
   try{
        const {directPercentage}=req.body;
        const queryGetDirRef=`SELECT * FROM direct_purchase`;
        const directReferralData=await queryPromise(queryGetDirRef); 
        if(directReferralData.length==0){
            return res.status(400).json({
                status:"error",
                message:"you should be add coin in  direct purchase",
            })
        }

   }catch(err){
    return res.status(500).json({
        status:"failed",
        message:"An error occurred while trying to add direct purchased coins",
        error:err.message
    })
   }
}

const queryPromise=(query,values=[])=>{
    return new Promise((resolve,reject)=>{
        pool.query(query,values,(err,result)=>{
            if(err) reject(err);
            else resolve(result);
        })
    })
}