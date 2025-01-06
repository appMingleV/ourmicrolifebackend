import axios from "axios"

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