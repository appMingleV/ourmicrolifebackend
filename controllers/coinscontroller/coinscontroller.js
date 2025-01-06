import pool from '../../config/db.js';
import {dateDetails} from '../../service/common/common.js'
import {getTeamPurchased} from  '../../service/refferralSystem/refferral.js' 
export const getCoins=(req,res)=>{
    const {userId}=req.params;
    try{
      const queryCoin=`Select value from coins where user_id=${userId}`;
    
      pool.query(queryCoin,(err,result)=>{
        if(err)return res.status(500).json({
            status:"failed",
            message:"operation failed"
        })
        console.log(result);
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
        message:err.message
      })
    }
}

//add coins when  successfully buy product-->
export const addCoinsOnProductBuy=async(req,res)=>{
      try{
        const {coins,products}=req.body;
        const {userId}=req.params;
        const queryUserExits=`SELECT * FROM tbl_users WHERE id=?`;
        const valueUser=[userId];
        const userDetails=await queryPromise(queryUserExits,valueUser);
        if(userDetails.length===0)return res.status(400).json({
          status:"failed",
          message:"User does not exist"
        })
        console.log(userDetails);
        if(userDetails[0].team!=null)putCoinsTeam(JSON.parse(userDetails[0].team));
        const queryAddCoins=`UPDATE coins SET value=value+? WHERE user_id=?`;
        const value=[coins,userId];
        const addCoins=await queryPromise(queryAddCoins,value);
        if(addCoins.affectedRows==0){
          return res.status(400).json({
              status:"error",
              message:"Coins are not added",
          })
        }
        const date=dateDetails();
    
        for(let row in products){
        
          const {heading,coin}=products[row];
          const queryHistoryCoin=`INSERT INTO coins_history (heading,coin_add_at,coin,user_id,coinStatus) VALUES (?,?,?,?,?)`;
          const valueHistory=[heading,date,coin,userId,true];
          const insertData=await queryPromise(queryHistoryCoin,valueHistory);
          if(insertData.affectedRows===0){
            return res.status(400).json({
                status:"error",
                message:"History coins are not added",
            })
          }
        }
        return res.status(200).json({
            status:"success",
            message:"Coins added successfully",
        })

      }catch(err){
        return res.status(500).json({
            status:"failed",
            message:"Operation failed",
            error:err.message
        })
      }
}


const putCoinsTeam=async(teams)=>{
    const teamData=await getTeamPurchased();
     for(let key in teams){
    
     }
}

export const getCoinHistory=async(req,res)=>{
  try{
    const {userId}=req.params;
    const queryHistoryCoin=`SELECT * FROM coins_history WHERE user_id=?`;
    const value=[userId];
    const coinHistory=await queryPromise(queryHistoryCoin,value);
    if(coinHistory.length==0){
      return res.status(400).json({
        status:"failed",
        message:"No coins history found"
      })
    }
    return res.status(200).json({
        status:"success",
        message:"Coins history fetched successfully",
        data:coinHistory
    })
  }catch(err){
    return  res.status(500).json({
      status:"failed",
      message:"operation failed"
    })
  }
}

//coins into rupees-->
export const coinsToCurrency=async(req,res)=>{
  try{
    const {coinsValue}=req.body;
    const queryCheckCoinValue=`SELECT * FROM coins_value`;
    const coinValue=await queryPromise(queryCheckCoinValue);
    if(coinValue.length===0){

    const queryAddCoinValue=`INSERT INTO coins_value (coin_value) VALUES (?)`;
    const value=[coinsValue];
    const addCoinValue=await queryPromise(queryAddCoinValue,value);
    
    if(addCoinValue.affectedRows==0)return res.status(400).json({
      status:"error",
      message:"Coins value is not added",
    })
  }else{
    const queryUpdateCoinValue=`UPDATE coins_value SET coin_value=? WHERE id=1`;
    const value=[coinsValue];
    const updateCoinValue=await queryPromise(queryUpdateCoinValue,value);
    if(updateCoinValue.affectedRows===0)return res.status(400).json({
      status:"error",
      message:"Coins value is not updated",
    })
  }
    return res.status(200).json({
      status:"success",
      message:"Coins value added successfully",
    })
  
    
  }catch(err){
    return  res.status(500).json({
      status:"failed",
      message:err.message
    })
  }
}


export const getCoinsCurrencyValue=async(req,res)=>{
  try{
     const queryCurrencyValue =`SELECT * FROM coins_value`;
     const currencyValue=await queryPromise(queryCurrencyValue);
    
     if(currencyValue.length==0)return res.status(200).json({
       status:"failed",
       message:"No coins value found"
     })

     return res.status(200).json({
       status:"success",
       message:"Coins value fetched successfully",
       data:currencyValue[0]
     })
  }catch(err){
    return  res.status(500).json({
      status:"failed",
      message:err.message
    })
  }
}
const queryPromise=(query,value=[])=>{
    return new Promise((resolve,reject)=>{
      pool.query(query,value,(err,result)=>{
        if(err) reject(err);
        else resolve(result);
      })
    })
}