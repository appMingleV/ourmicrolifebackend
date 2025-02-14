import pool from '../../config/db.js';
import {getMLM} from '../../service/refferralSystem/refferral.js'
import otpGenerator from 'otp-generator'
import {updatePosition} from '../../service/refferralSystem/refferral.js'
import jwt from 'jsonwebtoken'
const otpStorage = {};
export const userProfileUpdate=(req,res)=>{
    try{
       const {userId}=req.params;
       const {firstName,lastName,email}=req.body;
        console.log(userId,firstName,lastName,email)
       if(!firstName && !lastName && !email && !req.file){
        return res.status(400).json({
            status:"error",
            message:"Please provide at least one field to update"
        })
       }
       const queryUpdate=`UPDATE tbl_users SET first_name=?, last_name=?, email=?, profile_picture=? WHERE id=?`
       const value=[firstName,lastName,email,req?.file?.filename,userId];

       pool.query(queryUpdate,value,(err,result)=>{
             if(err){
                return res.status(500).json({
                    status:"error",
                    message:"Something went wrong while trying to update user profile",
                    error:err.message
                })
             }
             return res.status(200).json({
                 status:"success",
                 message:"User profile updated successfully",
             })
       })
      
    }catch(err){
        return res.status(500).json({
            status:"error",
            message:"Something went wrong while trying to update user profile",
            error:err.message
        })
    }
}

export const signupController=async (req,res)=>{
    const { firstName, lastName, email, mobileNumber, referralCode } = req.body;

    if (!firstName || !lastName || !email || !mobileNumber) {
        return res.status(400).json({ message: "All fields except referral code are required." });
    }

    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
    otpStorage[mobileNumber] = {firstName,lastName,email,otp}; // Store OTP temporarily

    // Send OTP via email (use an actual email service in production)
    

    try {
        
        res.status(200).json({ message: "OTP sent successfully!",otp,mobileNumber });
    } catch (error) {
        res.status(500).json({ message: "Error sending OTP", error });
    }
}

export const verifyOTP =async (req, res) => {
    const { mobileNumber, otp } = req.body;
    try{
    if (otpStorage[mobileNumber] && otpStorage[mobileNumber].otp === otp) {
        const token=jwt.sign({mobileNumber},process.env.JWT_SECRET)
        const querySignup=`INSERT INTO tbl_users (first_name, last_name, email,mobile_number,api_token) VALUES (?,?,?,?,?)`
        const value=[otpStorage[mobileNumber].firstName,otpStorage[mobileNumber].lastName,otpStorage[mobileNumber].email,mobileNumber,token];
        const userSet=await queryPromise(querySignup,value);
        if(!userSet){
            return res.status(400).json({
                status:"error",
                message:"server error",
            })
        }
      
        console.log(token);
        console.log(userSet)
        delete otpStorage[mobileNumber]; // Remove OTP after successful verification
        return res.status(200).json({ message: "OTP verified successfully!",token });
    }
    
    res.status(400).json({ message: "Invalid OTP or OTP expired" });
}catch(err){
    return res.status(500).json({ message: "Error verifying OTP", err:err.message });
}

};

export const checkReferralActive=async(req,res)=>{
       try{
            const {userId}=req.params;
            const queryCheckAmount=`SELECT * FROM  Transition WHERE user_id=?`
            const value=[userId];
            const dataQuery=await queryPromise(queryCheckAmount,value);
            if(dataQuery.length==0){
                 return res.status(200).json({
                    status: "success",
                    message: "No transition found",
                    refferalStatus:false,
                })
            }
           
            const amount=dataQuery[0]?.TransitionAm
            if(!amount){
                return res.status(200).json({
                    status: "success",
                    message: "No transition found",
                    refferalStatus:false,
                })
            }
            if(amount<500){
                return res.status(200).json({
                    status: "success",
                    message: "Referral not active",
                    refferalStatus:false,
                })
            }
            return res.status(200).json({
                status: "success",
                message: "referral is active",
                refferalStatus:true,
            })
       }catch(err){
        return res.status(500).json({
            status: "failed",
            message: "Unexpected error occurred",
            error: err.message,
        })
       }
}

export const payMLMAmount=async(req,res)=>{
    try{
       const {userId}=req.params;
    //    const {price}=req.body;
       const queryAddMLMAmount=`INSERT INTO Transition (user_id,TransitionAm,MLMStatus) VALUE (?,?,?-)`
       const value=[userId,500,true];
       const dataQuery=await queryPromise(queryAddMLMAmount,value);
       if(!dataQuery){
        return res.status(404).json({
            status:"error",
            message:"server error",
        })
       }
       const queryUpdateLevel=`UPDATE tbl_users SET  LEVEl="Sahyogi" WHERE id=?`
       const valueData=[userId]
       const updateData=await queryPromise(queryUpdateLevel,valueData);
        if(!updateData)return res.status(500).json({
            status:"error",
            message:"server error",
        })    

        return res.status(200).json({
                status: "success",
                message: "MLM  added successfully",
                data: dataQuery[0], 
            })
    }catch(err){
        return res.status(500).json({
            status: "failed",
            message: "Unexpected error occurred",
            error: err.message,
        })
    }
}

export const getProfile=async(req,res)=>{
    try{
       const {userId}=req.params;
       const queryGetProfile=`SELECT * FROM tbl_users WHERE id=?`;
       const value=[userId]
       const dataQuery=await queryPromise(queryGetProfile,value);
       if(dataQuery.length==0){
        return res.status(404).json({
            status:"error",
            message:"User not found",
        })
       }

       await updatePosition(userId);

       return res.status(200).json({
           status:"success",
           message:"User profile fetched successfully",
           data:dataQuery[0],
       })
    }catch(err){
        return res.status(500).json({
            status:"error",
            message:"Something went wrong while trying to fetch user profile",
            error:err.message
        })
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