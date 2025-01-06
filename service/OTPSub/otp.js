import axios from "axios"


export const otpImplementation=async(otp,mobile)=>{
    try{
        const templateId=process.env.TEMPLATEID
        const entityId = process.env.ENITYID;
        const  senderId = process.env.SENDERID;
        const  userNib= process.env.USERNIMBUS;
        const passNib= process.env.PASSWORDNIMBUS


      
        const message = `Your OUR MICROLIFE Login OTP is ${otp}. This is valid for 5 minutes.`;
       
       const response=await axios.get(`https://nimbusit.biz/api/SmsApi/SendSingleApi?UserID=${userNib}&Password=${passNib}&SenderID=${senderId}&Phno=${mobile}&Msg=${message}&EntityID=${entityId}&TemplateID=${templateId}`)
       return response.data;
    
}catch(err){
        return err;
    }
}