import { otpImplementation } from '../../service/OTPSub/otp.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import pool from '../../config/db.js';
const otpStore = [];
const SCRETEKEY="AFAGAGERGKGSFGG"
function generateOtp() {
    return Math.floor(1000 + Math.random() * 9000);
}

export const otpSend = async (req, res) => {
    try {
        const { mobile_number } = req.body;
        const mobileNumber = "+91" + mobile_number;

        // Twilio credentials from environment variables
      


        
        // Generate and store the OTP
        const otp = generateOtp();
        const otpData=await otpImplementation(otp,mobile_number)
      
         if(otpData.Status!=='OK'){
          return res.status(400).json(otpData);
         }

        
        otpStore[mobileNumber] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // OTP expires in 5 minutes

        // Send OTP via Twilio
        // const message = await client.messages.create({
        //     body: `Your OTP is ${otp}`,
        //     from: twilioNumber,
        //     to: mobileNumber,
        // });

        return res.json({
            status: "success",
            message: "OTP sent successfully",
            otp: otp, // Note: In production, don't return the OTP in the response for security
        });
    } catch (err) {
        return res.status(500).json({
            status: "failed",
            message: "Something went wrong while trying to send OTP",
            error: err.message,
        });
    }
};


export const verifyOtpSignup = (req, res) => {
    const authData = req.body.email
      ? { email: req.body.email }
      : { mobile: "+91" + req.body.mobile_number };
  
    const otp = req.body.otp;
  
    if ("email" in authData) {
      const { email } = authData;
      const storedOtpDetails = otpStore[email];
      if (
        storedOtpDetails &&
        storedOtpDetails.otp === parseInt(otp) &&
        storedOtpDetails.expiresAt > Date.now()
      ) {
        // OTP is valid
        delete otpStore[email]; // Clear OTP after verification
      
          return res.json({
            status: "success",
      
            message: "OTP verified successfully",
          });
 
      } else {
        // OTP is invalid or expired
        return res.status(400).json({
          status: "failed",
          message: "Invalid or expired OTP",
        });
      }
    } else {
      const { mobile } = authData;
      const storedOtpDetails = otpStore[mobile];
      if (
        storedOtpDetails &&
        storedOtpDetails.otp === parseInt(otp) &&
        storedOtpDetails.expiresAt > Date.now()
      ) {
        // OTP is valid
        delete otpStore[mobile]; // Clear OTP after verification
        
  
          return res.json({
            status: "success",
     
            message: "OTP verified successfully",
          });
    
      } else {
        // OTP is invalid or expired
        return res.status(400).json({
          status: "failed",
          message: "Invalid or expired OTP",
        });
      }
    }
  };




  export const emailOTP = async (req, res) => {
      try {
          const { email } = req.body;
  
          // Create a nodemailer transporter
          const transporter = nodemailer.createTransport({
              service: 'gmail',  // Replace with your email service
              secure: true,
              port: 465,
              auth: {
                  user: 'vanshdeep703@gmail.com', // Email account username (e.g., your Gmail address)
                  pass: 'ylql ugtz pouo qihs', // App password or email password
              },
          });
  
          // Generate OTP
          const otp = generateOtp();
  
          // Store the OTP with email as the key
          otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // OTP expires in 5 minutes
  
          // Email content
          const mailOptions = {
              from: 'vanshdeep703@gmail.com', // Sender's email
              to: email,                    // Recipient's email
              subject: 'Your OTP Code',     // Email subject
              text: `Your OTP code is: ${otp}`, // Email body
          };
  
          // Send OTP via email
          await transporter.sendMail(mailOptions);
  
          return res.json({
              status: "success",
              message: "OTP sent to email successfully",
              otp: otp, // Don't return OTP in production for security
          });
      } catch (err) {
          return res.status(500).json({
              status: "failed",
              message: "Something went wrong while trying to send OTP to email",
              error: err.message,
          });
      }
  }
  



  export const signup =async (req, res) => {

    try {
        const { ownerName, gender, dob, mobile, email, address, storeName, userName, storeCategory, storeAddress, BusinessContact, aadharNumber, PAN, documentType,refferralCode,mainStore,secondStore } = req.body;
        const { aadharNumberFront, aadharNumberBack, PANDocument, DocumentProof } = req.files
        if (ownerName == undefined || gender == undefined || gender=='' || dob == undefined || mobile == undefined || email == undefined || address == undefined || address == undefined || storeName == undefined || userName == undefined || storeAddress == undefined || storeCategory == undefined || aadharNumber == undefined || PAN == undefined || documentType == undefined || aadharNumberFront == undefined || aadharNumberBack == undefined || PANDocument == undefined || DocumentProof == undefined || refferralCode==undefined || mainStore==undefined || secondStore==undefined) {
            return res.status(404).json({
                status: "failed",
                message: "All fields are required",
            })
        }
        const token= jwt.sign({
          name:ownerName,
          dob,
          email
        },SCRETEKEY)
        console.log("token ======>  ",token)
        const queryPersonal = `INSERT INTO  storeUser (ownerName,gender,dob,mobile,email,address,status	,token,refferralCode,mainStore,secondStore) VALUES (?,?,?,?,?,?,?,?,?,?,?)`
        const values = [ownerName, gender, dob, mobile, email, address,"pending",token,refferralCode,mainStore,secondStore];
        const newStoreUser=await queryPromises(queryPersonal,values);
        console.log(newStoreUser);
        const storeUserId=newStoreUser?.insertId
        const queryStoreDetails=`INSERT INTO  storeUser (storeName,storeCategory,storeUserId,userName,storeAddress,BusinessContact,logo,banner) VALUES (?,?,?,?,?,?,?,?)`
        
        const valueStoreDetails=[storeName,storeCategory,storeUserId,userName,storeAddress,BusinessContact]
        return res.status(201).json({
          status:"sucessfully",
          message:"store user sucessfully registered",
          token
        })

    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to signup",
            error: err.message
        });
    }

}



const queryPromises=async(query,value)=>{
try{
 return new Promise((resolve,reject)=>{
     pool.query(query,value,(err,result)=>{
            if(err) return reject(err);
            resolve(result);
        })
 })
}catch(err){
   console.log(err) 
}
}