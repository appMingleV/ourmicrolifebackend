import pool from '../../config/db.js';
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


export const getProfile=(req,res)=>{
    try{
       const {userId}=req.params;
       const queryGetProfile=`SELECT * FROM tbl_users WHERE id=?`;
       const value=[userId]

       pool.query(queryGetProfile,value,(err,result)=>{
        if(err){
                return res.status(500).json({
                    status:"error",
                    message:"Something went wrong while trying to fetch user profile",
                    error:err.message
                })
             }
             return res.status(200).json({
                 status:"success",
                 message:"User profile fetched successfully",
                 user:result[0]
             })
       })
    }catch(err){
        return res.status(500).json({
            status:"error",
            message:"Something went wrong while trying to fetch user profile",
            error:err.message
        })
    }
}