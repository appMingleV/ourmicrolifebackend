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

export const teamDistrubutionPayOut=async(userId,value,coin,earningType,heading)=>{
    try{
        const queryTeamPurchases=await axios.get('https://api.ourmicrolife.com/api/admin/referral/teamPurchased');
        const coinsTeam=queryTeamPurchases.data.data  
        const coins = Object.values(coinsTeam);
         console.log("============================>  ",value)
        const teamCoins=coins.splice(0,1);
        console.log("teams coins ===============> ",coins)
   
        const queryTeam='SELECT team FROM tbl_users WHERE id=?'
        const values=[userId]
        const dataTeam=await queryPromise(queryTeam,values);
        const team=JSON.parse(dataTeam[0].team);
        console.log("team is  ",team);
        let teamLength=team.length
        
        for(let i=0;i<teamLength;i++){
            const queryTeamHead = `SELECT user_id FROM team_referral WHERE id=?`;
            const valuesTeam = [team[i]];
           
            const dataUserId = await queryPromise(queryTeamHead, valuesTeam);
            const userIdRef=dataUserId[0].user_id;
       
            const amount=+((value*coins[i+1])/100);
            console.log("amount=========================>    ",amount)
            const queryAddPayout=`INSERT INTO payout (user_id,amount,heading,coins,earning_type) VALUES (?,?,?,?,?)`
            const valuePayout=[userIdRef,amount,heading,coin,earningType];
            console.log("done =========================> ")
            await queryPromise(queryAddPayout,valuePayout);
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