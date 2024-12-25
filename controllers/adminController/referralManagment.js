

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


export const teamReferralManagement=async(req,res)=>{
      try{
        console.log(req.body)
        const queryCheckData=`SELECT * FROM team_referral_coin `;
        const DataTeamReferral=await queryPromise(queryCheckData);
        if(DataTeamReferral.length==0){
        const {level1,level2,level3,level4,level5,level6,level7,level8,level9,level10,level11,level12,level13,level14}=req.body;
        const queryGetTeamRef=`INSERT INTO team_referral_coin (level1,level2,level3,level4,level5,level6,level7,level8,level9,level10,level11,level12,level13,level14) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
        const values=[level1,level2,level3,level4,level5,level6,level7,level8,level9,level10,level11,level12,level13,level14];
        
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
        const {level1,level2,level3,level4,level5,level6,level7,level8,level9,level10,level11,level12,level13,level14}=req.body;
        const queryUpdateTeamRef=`UPDATE team_referral_coin SET level1=?,level2=?,level3=?,level4=?,level5=?,level6=?,level7=?,level8=?,level9=?,level10=?,level11=?,level12=?,level13=?,level14=? WHERE id=2`;
        const values=[level1,level2,level3,level4,level5,level6,level7,level8,level9,level10,level11,level12,level13,level14];
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

const queryPromise=(query,values=[])=>{
    return new Promise((resolve,reject)=>{
        pool.query(query,values,(err,result)=>{
            if(err) reject(err);
            else resolve(result);
        })
    })
}