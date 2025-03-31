import axios from "axios"
import pool from "../../config/db.js";
import { request } from "express";

export const directReferralCoin= async()=>{
    try{
    const response =await axios.get(`https://api.ourmicrolife.com/api/admin/referral/direct-referral/coin`);
   
          return response.data;
    }catch(err){
        return err;
    }
}

export const teamReferralCoin= async()=>{
    try{

     const response =await axios.get('https://api.ourmicrolife.com/api/admin/referral/team/coins');
     return response.data;

    }catch(err){
        return err;
    }
}

export const getTeamPurchased=async()=>{
    try{
      const response =await axios.get(`https://api.ourmicrolife.com/api/admin/referral/teamPurchased`);
      return response.data;
    }catch(err){
        return err;
    }
}


export const currencyValues=async()=>{
    try{
      const response =await axios.get('https://api.ourmicrolife.com/api/coins/currencyValueNow');
      return (+response.data.data.coin_value);
    }catch(err){
        return err;
    }
}

export const addTransactions=async(heading,directRefCoin,referredUserId,inserId,referral)=>{
const queryAddCoinHistory=`INSERT INTO coins_history (heading,coin_add_at,coin,user_id,coinStatus,orderId,earning_type) VALUES (?,?,?,?,?,?,?)`;
const value=[heading,new Date(),directRefCoin,referredUserId,true,inserId,referral]
    await queryPromise(queryAddCoinHistory,value);
}

export const getMLM=async()=>{
    try{
       const response = await axios.get('http://api.ourmicrolife.com/api/admin/referral/mlmPosition');
    
       return response.data;
    }catch(err){
        return err;
    }
}
 
export const selfPurchased=async(userId,value,coin,earningType,heading)=>{
    try{
      const selfPurchasedResponse=await axios.get(`https://api.ourmicrolife.com/api/admin/referral/directPurchased`);
      console.log(selfPurchasedResponse);
      return "";
    }catch(err){
        return err;
    }
}

const referralData=[50,20,6,5,4,3,2,1,1,1,1,1,1,1];
export const referralPayout= async (userId)=>{
    try{
      const queryGetTeam=`SELECT team FROM tbl_users WHERE id=?`
      const valueTeam=[userId];
      const coins=50;
      let payout=250;
      const teamData=await queryPromise(queryGetTeam,valueTeam);
      const teamMLM=teamData[0]?.team!=null?JSON.parse(teamData[0]?.team):[];
      const team=[userId,...teamMLM]
      for(let i=0;i<referralData.length && i<team.length;i++){
           const queryTeamHead = `SELECT user_id FROM team_referral WHERE id=?`;
            const valuesTeam = [team[i]];
            const dataUserId = await queryPromise(queryTeamHead, valuesTeam);
            console.log(dataUserId);
            const userIdRef=i==0?team[i]:dataUserId[0]?.user_id;
          console.log("team is now working========================    ",team.length)
          const queryCheck=`SELECT * FROM  wallets WHERE  earning_type='referral' AND userId=?`;
          const dateCheck=await queryPromise(queryCheck,[userIdRef]);
          console.log("===============================>   ",team[i])
          const queryAddPayout=`INSERT INTO payout (user_id,amount,heading,coins,earning_type) VALUES (?,?,?,?,?)`
          const valueAdd=[userIdRef,(payout*referralData[i])/100,"referral earingin",50,"referral"]
          await queryPromise(queryAddPayout,valueAdd);
          if(dateCheck.length==0){
              const queryAddMLMUser=`INSERT INTO wallets (userId,earning_type,coins,payout,created) VALUES (?,?,?,?,?)`
              const value2=[userIdRef,"referral",50,((payout*referralData[i])/100),new Date().toISOString()];
              await queryPromise(queryAddMLMUser,value2);
          }else {
            const queryUpdateMLMUser = `UPDATE wallets 
                                    SET coins = coins + ?, 
                                    payout = payout + ? 
                                WHERE userId = ? AND earning_type = "referral"`;
    
             const valueUpdate = [50, ((payout * referralData[i]) / 100), userIdRef];
          const doneWallte= await queryPromise(queryUpdateMLMUser, valueUpdate);
          console.log(doneWallte)
          }
      }
      
     return {
        status:"success",
        message:"successfully done"
     }
    }catch(err){
        return  err;
    }
}
export const teamDistrubutionPayOut=async(userId,value,coin,earningType,heading)=>{
    try{
        const queryTeamPurchases=await axios.get('https://api.ourmicrolife.com/api/admin/referral/teamPurchased');
        const coinsTeam=queryTeamPurchases.data.data  
        const coins = Object.values(coinsTeam);
 
        const teamCoins=coins.splice(0,1);
   
        const queryTeam='SELECT team FROM tbl_users WHERE id=?'
        const values=[userId]
        const dataTeam=await queryPromise(queryTeam,values);
        const team=JSON.parse(dataTeam[0]?.team);
        console.log("team is  ",team);
        let teamLength=team?.length || []
        
        for(let i=0;i<teamLength;i++){

            const queryTeamHead = `SELECT user_id FROM team_referral WHERE id=?`;
            const valuesTeam = [team[i]];
            const dataUserId = await queryPromise(queryTeamHead, valuesTeam);
            console.log(dataUserId);
            const userIdRef=dataUserId[0]?.user_id;
        
            const amount=+((value*coins[i+1])/100);
                
            const queryAddPayout=`INSERT INTO payout (user_id,amount,heading,coins,earning_type) VALUES (?,?,?,?,?)`
            const valuePayout=[userIdRef,amount,heading,coin,earningType];
            const payDetails= await queryPromise(queryAddPayout,valuePayout);
             console.log("==============>  ",payDetails);
            const queryCheck=`SELECT * FROM  wallets WHERE earning_type='group' AND userId=?`;
            const dateCheck=await queryPromise(queryCheck,[team[i]]);
            if(dateCheck.length==0){
              const queryAddMLMUser=`INSERT INTO wallets (userId,earning_type,coins,payout,created) VALUES (?,?,?,?,?)`
              const value2=[userIdRef,"group",coin,amount,new Date().toISOString()];
              await queryPromise(queryAddMLMUser,value2);
          }else {
               const queryUpdateMLMUser = `UPDATE wallets 
                                SET coins = coins + ?, 
                                    payout = payout + ? 
                                WHERE userId = ? AND earning_type = "group"`;
               const valueUpdate = [coin,amount,userIdRef];
               await queryPromise(queryUpdateMLMUser, valueUpdate);
          }
           
        }
        return ;
    }catch(err){
        return err;
    }
}



export const updatePosition=async(userId)=>{
    const getMLMPosition=await getMLM();
     
    const queryGetDirectReferral=`SELECT referral_to FROM direct_referrals WHERE  referral_from=?`
    const valueData=[userId];
    const dataDirectReferral=await queryPromise(queryGetDirectReferral,valueData);
   
    const getLevel=[];
    const getProfileLevelCount=new Map();
    for(let i=0;i<dataDirectReferral.length;i++){
     const referalUserId=dataDirectReferral[i]?.referral_to;
     const queryUserLevel=`SELECT level from tbl_users where id=?`
     const valueReferralId=[referalUserId]
     const dataUserLevel=await queryPromise(queryUserLevel,valueReferralId);
      if(dataUserLevel[0]?.level!=null) getLevel.push(dataUserLevel[0]?.level);
    }

    
    for(let i=0;i<getLevel.length;i++){
     if(getProfileLevelCount.has(getLevel[i])){
         getProfileLevelCount.set(getLevel[i],getProfileLevelCount.get(getLevel[i])+1);
     }else{
         getProfileLevelCount.set(getLevel[i],1);
     }
    }

    for(let i=getMLMPosition?.data.length-1;i>=0;i--){
     
       let position=getMLMPosition?.data[i]?.award.split(" ")[1];
       const count=getProfileLevelCount.get(position);
       if(position==="Diamond"){
         if(getProfileLevelCount.get("Diamond")>=5){
              await updateUserLevel("Director",userId)
               break;
         }
       }else if(count==5){

         position=getMLMPosition?.data[i+1]?.award.split(" ")[1];
          await updateUserLevel(position,userId);
         break;
     }  
    }
}

const updateUserLevel= async (position,userId)=>{
    const queryUpdateUser=`UPDATE tbl_users SET level=?,paid_status_=? WHERE id=?`
    const value=[position,false,userId];
    const updateProfile=await queryPromise(queryUpdateUser,value);

}

export const  walletTransactions=async(userId,earningType,coins,payout)=>{
    try{
        if(earningType=="self"){
           const queryWalletTransactions=`UPDATE wallets SET coins=?,payout=? WHERE earning_type=? AND userId=?`;
           const valueQuery=[]
        }
    }catch(err){
        console.log(err);
        return;
    }
}
export const getAllPositonAmount=async (position)=>{
    try{
        let level=position || null;
        const queryGetPositionAmount=`SELECT * FROM payment_position WHERE award=?`;
        const data=await queryPromise(queryGetPositionAmount,[level]);
        console.log("hello  ",data);
        return data[0];
    }catch(err){
        console.log(err);
        return;
    }
}

export const getTentativeCoin=async(position)=>{
    try{
      const queryDataCoins=`SELECT * FROM Tentative_coins WHERE award=?`;
      const dataCoins=await queryPromise(queryDataCoins,[position]);
      return dataCoins[0];
    }catch(err){
        return err;
    }
}

export const getProfileCoins=async(position)=>{
    try{
        const queryCoinAsPosition=`SELECT coinValue FROM Tentative_coins  WHERE award=?`
        const value=[position];
        const dataCoinsTentative=await queryPromise(queryCoinAsPosition,value);
        console.log(dataCoinsTentative);
        if(dataCoinsTentative.length==0)return null;
        
        return dataCoinsTentative[0].coinValue;
    }catch(err){
        return err
    }
}

const queryPromise=async(query,value=[])=>{
    return new Promise((resolve,reject)=>{
           pool.query(query,value,(err,result)=>{
            if(err){
                reject(err);
            }
            resolve(result);
           })
    })
}