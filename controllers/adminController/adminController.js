import nodemailer from 'nodemailer';
import pool from '../../config/db.js'
import {refferalCreate,} from '../../controllers/refferalController/refferController.js'
import {sendMailPaymentAprovalMLM,sendMailMLMPosition,sendVerification} from '../../service/common/common.js'
import jwt from 'jsonwebtoken'
// const SCRETEKEY=process.env.JWT_SECRET
export const vedorList = (req, res) => {
    try {
        const { query } = req.params;
        const arrQuery = ["pending", "reject", "suspended", "accept", "all"];
        if (arrQuery.indexOf(query) == -1) {
            return res.status(400).json({
                status: "failed",
                message: "Invalid query parameter, provides correct parameters"
            })
        } else if (query == "all") {

            const qeuryVendorList = `SELECT id,ownerName,gender,dob,mobile,email,address,status FROM Vendor`;
            pool.query(qeuryVendorList, (err, result) => {
                if (err) {
                    return res.status(500).json({
                        status: "error",
                        message: "Something went wrong while trying to fetch vendor list",
                        error: err.message
                    })
                }
                if (result.length)
                    return res.status(200).json({
                        status: "success",
                        message: "vendor list  successfully retrieved",
                        data: result
                    })
            })
        } else {

            const queryVendorList = `SELECT id,ownerName,gender,dob,mobile,email,address,status FROM Vendor WHERE status=?`;
            const values = [query.charAt(0).toUpperCase() + query.slice(1)];
            pool.query(queryVendorList, values, (err, result) => {
                if (err) {
                    return res.status(500).json({
                        status: "error",
                        message: "Something went wrong while trying to fetch vendor list",
                        error: err.message
                    })
                }
                if (result.length === 0) {
                    return res.status(404).json({
                        status: "failed",
                        message: "No vendor found matching the criteria",
                    })
                }
                return res.status(200).json({
                    status: "success",
                    message: "Vendor list fetched successfully",
                    data: result
                })
            })
        }

    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to fetch vendor list",
            error: err.message
        })
    }

}





export const updateUserKYCBank=async(req,res)=>{
    try{
       const {userId}=req.params;
       const {status}=req.body;
       if(!status){
        return res.status(404).json({
            status:"failed",
            message:"status is messing field"
        })
       }
       const queryUserDetail=`SELECT * FROM tbl_users WHERE id=?`
       const dataUserProfile=await queryPromises(queryUserDetail,[userId]);
       const email=dataUserProfile[0]?.email;
       const queryUpdate=`UPDATE tbl_users SET filled_bankDetail=?, kyc_status=? WHERE id=?`
       
       if(status=="completed"){
           const updateUser=await queryPromises(queryUpdate,[status,status,userId]);
           await sendVerification(email,true)
       }else{
            const updateUser=await queryPromises(queryUpdate,[status,status,userId]);
            await sendVerification(email,false)
       }
       return res.status(200).json({
        status:"success",
        message:"status successfully updated"
       })
    }catch(err){
        return res.status(500).json({
             status: "error",
            message: "Something went wrong while trying to fetch vendor list",
            error: err.message
        })
    }
}

export const singleVendor = (req, res) => {
    try {
        const { vendorId } = req.params;
        const queryVendorDetails = `SELECT ownerName,gender,dob,mobile,email,address,status FROM Vendor WHERE id=?`;
        const value = [vendorId]
        pool.query(queryVendorDetails, value, (err, result) => {
            if (err) {
                return res.status(500).json({
                    status: "error",
                    message: "Something went wrong while trying to fetch vendor details",
                    error: err.message
                })
            }
            if (result.length == 0) {
                return res.status(400).json({
                    status: "failed",
                    message: "No vendor found",
                })
            }
            const queryVendorShopDetails = `SELECT * FROM vendorStoreDetails WHERE vendor_id=?`
            const value1 = [vendorId];
            pool.query(queryVendorShopDetails, value1, (err, result1) => {
                if (err) {
                    return res.status(500).json({
                        status: "error",
                        message: "Something went wrong while trying to fetch vendor shop details",
                        error: err.message
                    })
                }
                const queryVendorKYCDetails = `SELECT * FROM VendorKYCDetails WHERE vendor_id=?`;
                const value2 = [vendorId];
                pool.query(queryVendorKYCDetails, value2, (err, result2) => {
                    if (err) {
                        return res.status(500).json({
                            status: "error",
                            message: "Something went wrong while trying to fetch vendor KYC details",
                            error: err.message
                        })
                    }
                    return res.status(200).json({
                        status: "success",
                        message: "Vendor details fetched successfully",
                        vendor: result[0],
                        vendorStoreDetails: result1[0],
                        vendorKYCDetails: result2[0]
                    })
                })
            })

        })

    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to change vendor status",
            error: err.message
        })
    }
}


//admin can access dashboard for vendor--->
export const vedorChangeStatus = (req, res) => {
    try {
        const { vendorId } = req.params
        const { status } = req.body;

        if (status == "Accept") {
            const querUpdateStatus = `UPDATE Vendor SET status=? WHERE id=?`;
            const value = [status, vendorId];
            pool.query(querUpdateStatus, value, (err, result) => {
                if (err) {
                    return res.status(500).json({
                        status: "error",
                        message: "Something went wrong while trying to accept vendor",
                        error: err.message
                    })
                }
                if (result.length === 0) {
                    return res.status(400).json({
                        status: "failed",
                        message: "Vendor not found"
                    })
                }
                return res.status(200).json({
                    status: "success",
                    message: "Vendor accepted successfully"
                })
            })
        } else {
            const { description } = req.body;
            const queryVendor = `SELECT email FROM Vendor WHERE id=?`;
            const value = [vendorId];
            pool.query(queryVendor, value, (err, result) => {
                if (err) {
                    return res.status(500).json({
                        status: "error",
                        message: "Something went wrong while trying to fetch vendor email",
                        error: err.message
                    })
                }
                if (result.length === 0) {
                    return res.status(400).json({
                        status: "failed",
                        message: "Vendor not found"
                    })
                }
                const { email } = result[0];
                const queryUpdateStatus = `UPDATE Vendor SET status=? WHERE id=?`
                const value = [status, vendorId];
                pool.query(queryUpdateStatus, value, async (err, status) => {
                    if (err) {
                        return res.status(500).json({
                            status: "error",
                            message: "Something went wrong while trying to update vendor status",
                            error: err.message
                        })
                    }
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        secure: true,
                        port: 465,
                        auth: {
                            user: 'vanshdeep703@gmail.com',
                            pass: 'ylql ugtz pouo qihs', // Use an app password for Gmail
                        }
                    })

                    const mailConfig = {
                        from: 'vanshdeep703@gmail.com',
                        to: email,
                        subject: 'Vendor Status Update',
                        text: `Your vendor status has been updated. Current status: ${status}. ${description}`
                    }
                    await transporter.sendMail(mailConfig);
                    return res.status(200).json({
                        status: "success",
                        message: "Vendor status updated successfully and email sent to vendor"
                    })
                })
            })
        }
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to change vendor status",
            error: err.message
        })
    }
}
 
export const getMLMUser=async(req,res)=>{
     try{
   
       const queryMLMUser = `SELECT * FROM Transition`;
       const MLMUsers = await queryPromises(queryMLMUser)
       if (MLMUsers.length == 0) {
            return res.status(400).json({
                status: "failed",
                message: "No MLM user found"
            })
        }
    
        for(let i=0;i<MLMUsers.length;i++){
            const userId=MLMUsers[i]?.user_Id;
        
            const queryUserDetail = `SELECT first_name,last_name,mobile_number,email FROM tbl_users WHERE id=?`
            const value1 = [userId];
            const getUserData=await queryPromises(queryUserDetail,value1);
            // console.log("======================>     ",getUserData)
            MLMUsers[i].name=getUserData[0]?.first_name+getUserData[0]?.last_name;
            MLMUsers[i].mobile=getUserData[0]?.mobile_number;
            MLMUsers[i].email=getUserData[0]?.email
        }
        
       return res.status(200).json({
            status: "success",
            message: "MLM User list successfully retrieved",
            data: MLMUsers
        })
     }catch(err){
            return res.status(500).json({
                status: "error",
                message: "Something went wrong while trying to fetch MLM User",
                error: err.message
            })
     }
}


export const getAllUserDetails = async (req, res) => {
  try {
    const query = `
  SELECT 
    u.id,
    u.first_name,
    u.last_name,
    u.email,
    u.MLMStatus,
    u.mobile_number,
    u.level,
    r.referral_link,
    r.referral_code,
    t.transition_id,
    b.bank_id,
    k.kyc_id
  FROM tbl_users u
  LEFT JOIN (
    SELECT user_id, referral_link, referral_code FROM refferal GROUP BY user_id
  ) r ON u.id = r.user_id
  LEFT JOIN (
    SELECT user_id, MAX(id) as transition_id FROM Transition GROUP BY user_id
  ) t ON u.id = t.user_id
  LEFT JOIN (
    SELECT user_id, MAX(id) as bank_id FROM bank_nominee_details GROUP BY user_id
  ) b ON u.id = b.user_id
  LEFT JOIN (
    SELECT userId, MAX(id) as kyc_id FROM user_KYC GROUP BY userId
  ) k ON u.id = k.userId
`;
    const rawData = await queryPromises(query);

    const dataAllUser = rawData.map(user => {
      const {
        referral_link,
        referral_code,
        transition_id,
        bank_id,
        kyc_id,
        ...userDetails
      } = user;

      return {
        ...userDetails,
        referral: (referral_link || referral_code) ? {
          referral_link,
          referral_code
        } : null,
        paymentMLM: !!transition_id,
        bankDetails: !!bank_id,
        userKYC: !!kyc_id
      };
    });

    return res.status(200).json({
      status: "success",
      message: "All users details fetched successfully",
      data: dataAllUser
    });

  } catch (err) {
    return res.status(500).json({
      status: "failed",
      message: "We have failed to fetch details",
      error: err.message
    });
  }
}

export const widthdrawFunstionality=async(req,res)=>{
      try{
       const {userId}=req.params;
       const queryWithdrawHistory=`SELECT * FROM Withdraw WHERE userId=? AND (paymentStatus="success" OR paymentStatus="rejected")`
       const queryWithdrawpending=`SELECT * FROM Withdraw WHERE userId=? AND (paymentStatus="inprogress" OR paymentStatus="failed")`
       const dataRequest=await queryPromises(queryWithdrawpending,[userId]);
       const dataWithdraw=await queryPromises(queryWithdrawHistory,[userId]);
       const userDetails=`SELECT * FROM tbl_users WHERE id=?`
       const dataUserDetails=await queryPromises(userDetails,[userId]);
       const bankDetails=`SELECT id,account_holder_name,account_number,confirm_account_number,bank_name,ifsc_code FROM bank_nominee_details WHERE user_id=?`
       const dataBankDetails=await queryPromises(bankDetails,[userId]);
       const queryUserUPI=`SELECT * FROM upi_user WHERE userId=?`;
       const dataUserUPI=await queryPromises(queryUserUPI,[userId]);
       return res.status(200).json({
        status:"success",
        message:"all details fetch  successfully",
        data:{
            history:dataWithdraw,
            request:dataRequest,
            userData:dataUserDetails,
            paymentMethod:{
                bank:dataBankDetails,
                upi:dataUserUPI
       }}})
      }catch(err){
        return res.status(500).json({
      status: "failed",
      message: "We have failed to fetch details",
      error: err.message
    });
      }
}

export const loginEcommerce=async(req,res)=>{
    try{
    const {email,password}=req.body;
     const queryCheckUser=`SELECT * FROM users WHERE email=?`
     const dataUsers=await queryPromises(queryCheckUser,[email])
     if(dataUsers.length==0){
        return res.status(404).json({
            status:"failed",
            message:"user is not found"
        })
     }

     if(dataUsers[0]?.password!=password){
        return res.status(403).json({
            status:"failed",
            message:"password is not matching"
        })
     }
        const token=jwt.sign({
            email,
            password
        },"c3f8f4e8c7b47c6f0f2a9d8a6b24e648dfb15c51f83deea98f7b4c92c9e2d47a")
        return res.status(200).json({
            status:"sucessfully",
            message:"login sucessfully",
            token
        })
    }catch(err){
       return res.status(500).json({
      status: "failed",
      message: "We have failed to fetch details",
      error: err.message
    });
    }
}


export const orderItemsByOrder=async(req,res)=>{
    try{
        const {orderId}=req.params;
        const queryAllOrders=`SELECT * FROM orders_cart WHERE id=?`  
        const dataAllOrder=await queryPromises(queryAllOrders,[orderId]);
        const addressId=dataAllOrder[0].shipping_address_id
        const queryAddres=`SELECT * FROM  shipping_addresses WHERE id=?`
        const dataAddressDetail=await queryPromises(queryAddres,[addressId]);
        const queryOrderItems=`SELECT * FROM order_items WHERE order_id=?`;
        const dataOrderItems=await queryPromises(queryOrderItems,[orderId])
         return res.status(200).json({
            status:"success",
            message:"Order Items succesfully fetched",
            data:{
               addressDetails:dataAddressDetail,
               orderItems:dataOrderItems,
               orderPayment:dataAllOrder
            }
         })
    }catch(err){
         return res.status(500).json({
      status: "failed",
      message: "We have failed to fetch details",
      error: err.message
    });
    }
}

export const ecomerceOrders=async(req,res)=>{
    try{
       const queryAllOrders=`SELECT * FROM orders_cart`  
       const dataAllOrder=await queryPromises(queryAllOrders);
       
       for(let e of dataAllOrder){
         const orderId=e?.id;
         const queryOrderItems=`SELECT * FROM order_items WHERE order_id=?`;
         const dataOrderItems=await queryPromises(queryOrderItems,[orderId])
         e.ordersItems=dataOrderItems
         for(let  t of dataOrderItems){
            const vendorId=t.vendor_id
            const queryVendorName=`SELECT ownerName FROM Vendor WHERE id=?`
            const dataVendorName=await queryPromises(queryVendorName,[vendorId]);
            t.vendorName=dataVendorName[0]?.ownerName;
         }
       }
       return res.status(200).json({
        status:"succees",
        message:"fetch all details of orders",
        data:dataAllOrder
       })
    }catch(err){
        return res.status(500).json({
      status: "failed",
      message: "We have failed to fetch details",
      error: err.message
    });
    }
}
export const withdrawStatus=async(req,res)=>{
    try{
        console.log("with draw =====>  ")
       const {id}=req.params;
       const {status}=req.body;
       const queryUpdated=`UPDATE Withdraw SET paymentStatus=? WHERE id=?`
       const value=[status,id];
       const updateStatus=await queryPromises(queryUpdated,value);
       return res.status(200).json({
         status:"success",
         message:`payment status successfully updated`

       })
    }catch(err){
         return res.status(500).json({
      status: "failed",
      message: "We have failed to fetch details",
      error: err.message
    })
}
}
export const mlmLogin=async(req,res)=>{
     try{
        const {email,password}=req.body;
        if(!email || !password){
            return  res.status(404).json({
                status:"failed",
                message:"all fields are required"
            })
        }
        const querryMlmUser=`SELECT * FROM  users WHERE email=?`
        const dataMlmUser=await queryPromises(querryMlmUser,[email]);
        if(dataMlmUser.length==0){
            return res.status(404).json({
                status:"failed",
                message:"user is not found",
            })
        }

        if(password!=dataMlmUser[0].password){
            return res.status(403).json({
                status:"failed",
                message:"password is not matching",
            })
        }
        // console.log(SCRETEKEY);
      const token=jwt.sign({
            email,
            password
        },"c3f8f4e8c7b47c6f0f2a9d8a6b24e648dfb15c51f83deea98f7b4c92c9e2d47a")
        return res.status(200).json({
            status:"sucessfully",
            message:"login sucessfully",
            token
        })

     }catch(err){
       return res.status(500).json({
                status: "error",
                message: "Something went wrong while trying to fetch MLM User",
                error: err.message
            })
     }
}

export const getSingleUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const queryDetailsUser = `
SELECT 
  u.*, 
  r.referral_link,
  r.referral_code,
  b.*, 
  f.*
FROM tbl_users u
LEFT JOIN refferal r ON u.id = r.user_id
LEFT JOIN bank_nominee_details b ON u.id = b.user_id
LEFT JOIN upi_user f ON u.id = f.userId
WHERE u.id = ?
    `;
     
    const dataUserDetails = await queryPromises(queryDetailsUser, [userId]);
     if(dataUserDetails.length==0){
        return  res.status(200).json(
            {
                status:"sucessfull",
                message:"data is not found"
            }
        )
     }
    const queryFindKYC=`SELECT * FROM user_KYC WHERE userId=?`
    const dataKYC=await queryPromises(queryFindKYC,[userId]);
    const queryAddress=`SELECT * FROM shipping_addresses WHERE user_id=?`
    const dataAddress=await queryPromises(queryAddress,[userId]);

     dataUserDetails[0].KYC=dataKYC[0];
     dataUserDetails[0].address=dataAddress;
     const queryReferralName=`SELECT * FROM direct_referrals WHERE referral_to=?`
     const dataRefferName=await queryPromises(queryReferralName,[userId]);
     const referralId=dataRefferName[0]?.referral_from || null;
     const queryUserName=`SELECT * FROM tbl_users WHERE id=?`
     const dataReferralUserName=await queryPromises(queryUserName,[referralId]);
     dataUserDetails[0].referralName=dataReferralUserName[0]?.first_name+dataReferralUserName[0]?.last_name
    return res.status(200).json({
      status: "success",
      message: "Successfully fetched user details",
      data: dataUserDetails[0] || {},
    });

  } catch (err) {
    return res.status(500).json({
      status: "failed",
      message: "Error fetching user details",
      error: err.message
    });
  }
};

export const getHightestCoin=async(req,res)=>{
    try{
          const queryUserCoins=`SELECT 
          c.*,
          r.id,
          r.*
          FROM coins c
          LEFT JOIN tbl_users r ON c.user_id = r.id
          ORDER BY c.value DESC
          `
          const dataUserCoins=await queryPromises(queryUserCoins);
        
          return res.status(200).json({
            status:"sucessfully",
            message:"Get All Details of Users",
            dataUserCoins
          })
    }catch(err){
        return res.status(500).json({
      status: "failed",
      message: "Error fetching user details",
      error: err.message
    });
    }
}
// export const KYCDetails=async(req,res)=>{
//     try{
//       const {userId}=req.params;
//       if(!userId)return res.status(200).json({
                 
//       })
//     }catch(err){
//          return res.status(500).json({
//       status: "failed",
//       message: "Error fetching user details",
//       error: err.message
//     })
// }
// }

export const addUPI=async(req,res)=>{
    try{
         const {userId}=req.params;
         const {upiId,upiName}=req.body;
         const queryAddDetails=``
         
    }catch(err){
        return res.status(500).json({
      status: "failed",
      message: "Error fetching user details",
      error: err.message
    });
    }
}

export const upateMLMMemberStatus=async(req,res)=>{
    try{ 
        const {userId}=req.params;
        const { status } = req.body;
        const refferalCode = req.decrypt; 
        if(!userId || !status)return res.status(404).json({
            status: "failed",
            message: "Missing required field"
        })
    
        const quueryUpdateStatus=`UPDATE Transition SET  MLMStatus=?,adminStatus=? WHERE user_id=?`
        const values=[status,true,userId];
        const updateUser=await queryPromises(quueryUpdateStatus,values);
        if (!updateUser){
            return res.status(400).json({
                status: "failed",
                message: "No MLM Member found with this id"
            })
        }
        ///////////////////////////////////////////////////////////
        if(status=="accepted"){
            const queryUpdateMlmStatus = `
            UPDATE tbl_users 
            SET MLMStatus = ?, 
                MLMStatus_date = CURDATE(), 
                level = "Sahyogi" 
            WHERE id = ?
          `;
        console.log(status);
        const values1=[true,userId];
        const queryCheckUser=`SELECT * FROM mlm_duration WHERE userId=?`
        const value=[userId]
        const dataCheckUser=await queryPromises(queryCheckUser,value);
        console.log("data checker =====> ",dataCheckUser);
        if(dataCheckUser?.length===0){
        const startDate = new Date();
        const endDate = new Date(startDate); // Create a new Date object to avoid modifying startDate
        endDate.setDate(startDate.getDate() + 30);
         console.log("referral_code");
        const updateMlmStatus=await queryPromises(queryUpdateMlmStatus,values1);
        
        const queryAddMLMDuration=`INSERT INTO mlm_duration (startDate,endDate,coinValue,payOut,userId) VALUES (?,?,?,?,?)`
        const values2=[startDate,endDate,0,0,userId];
        await queryPromises(queryAddMLMDuration,values2);
       
        await refferalCreate(refferalCode,userId)
        const queryUser=`SELECT * FROM tbl_users WHERE id=?`;
        const userDetails=await queryPromises(queryUser,[userId]);
        const refferalCodeUser=await queryPromises(`SELECT * FROM refferal WHERE user_id=?`,[userId]);
        const transactionId=await queryPromises(`SELECT * FROM Transition WHERE user_id=?`,[userId]);
        const userData=userDetails[0];
        const refferalData=refferalCodeUser[0];
        const transactionDetails=transactionId[0];
        sendMailPaymentAprovalMLM(userData?.email,userData?.first_name,"Payment Approval",refferalData.referral_code,transactionDetails.transition_id,transactionDetails.date_transaction,refferalData.referral_link)
        await setMLMWallet(userId);
        }
    }
      return res.status(200).json({
            status: "success",
            message: "MLM Member status updated successfully",
            user:updateUser
        })
    }catch(err){
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to update MLM Member Status",
            error: err.message
        })
    }
}
async function setMLMWallet(userId){
         const queryAddMLMUser=`INSERT INTO wallets (userId,earning_type,coins,payout,created) VALUES (?,?,?,?,?)`
         const value=[userId,"self",0,0,new Date().toISOString()];
         const value1=[userId,"group",0,0,new Date().toISOString()];
         const value2=[userId,"referral",0,0,new Date().toISOString()];
         await queryPromises(queryAddMLMUser,value);
         await queryPromises(queryAddMLMUser,value1);
         await queryPromises(queryAddMLMUser,value2);
}
// const checkUserExists = (query,userId)=>{
        
// }
export const vendorOrderList = async (req, res) => {
    try {
        
        const { vendorId } = req.params;
        const queryVendorOrder = `SELECT * FROM  order_items WHERE vendor_id=?`;
        const values = [vendorId];
        const orderItems = await queryPromises(queryVendorOrder, values)
        if (orderItems.length == 0) {
            return res.status(400).json({
                status: "failed",
                message: "No vendor order found"
            })
        }
        let orderDetails=[]
        for (let i = 0; i < orderItems.length; i++) {
            const productId = orderItems[i].product_id;
            const orderId=orderItems[i].order_id;
            const queryProductDetail = `SELECT name,featured_image FROM products WHERE id=?`
            const value1 = [productId];
            const getProductData=await queryPromises(queryProductDetail,value1);
            const queryStatus=`SELECT payment_status,payment_type FROM orders_cart WHERE id=?`;
            const value2=[orderId];
            const orderStatus=await queryPromises(queryStatus,value2);
            const order={
                orderId:orderId,
                productName:getProductData[0]?.name||"not available",
                productImage:getProductData[0]?.featured_image||"not available",
                totalAmount:orderItems[i]?.total_price,
                size:orderItems[i]?.size||"not available",
                color:orderItems[i]?.color||"not available",
                status:orderStatus[0]?.payment_status||"not available",
                paymentType:orderStatus[0]?.payment_type||"not available"
            }
            orderDetails.push(order)
        }
        return res.json({
            status: "success",
            message: "Vendor order list fetched successfully",
            data: orderDetails
        })

    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to fetch vendor order list",
            error: err.message
        })
    }
}

export const getnewMLMUser=async(req,res)=>{
    try{
        const {userId}=req.params;
        if(!userId)return res.status(404).json({
            status: "failed",
            message: "Missing required field"
        })
        const queryMLMUser=`SELECT * FROM Transition WHERE user_id=?`;
        const dataMLMUser=await queryPromises(queryMLMUser,[userId]);
        if (dataMLMUser.length==0){
            return res.status(400).json({
                status: "failed",
                message: "No MLM User found with this id"
            })
        }
        const queryUserData=`SELECT * FROM tbl_users WHERE id=?`
        const dataUserData=await queryPromises(queryUserData,[userId]);
        if (dataUserData.length==0){
            return res.status(400).json({
                status: "failed",
                message: "No MLM User found with this id"
            })
        }
        dataMLMUser[0].userDetail=dataUserData[0];
        return res.status(200).json({
            status: "success",
            message: "MLM User fetched successfully",
            data: dataMLMUser,
       
        })
 
    }catch(err){
          return res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to fetch MLM User",
            error: err.message
        })
    }
}

export const getBankDetails =async (req, res) =>{
    try{
     const dataMLMUser =`SELECT * FROM bank_nominee_details `
     const dataBanks=await queryPromises(dataMLMUser)
     return res.status(200).json(
        {
            status: "success",
            message: "Bank details fetched successfully",
            data: dataBanks,
        })
    }catch(err){
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to fetch bank details",
            error: err.message
        })
    }
}

export const withdrawUser=async(req,res)=>{
    try{
     const queryAllUser=`SELECT * FROM Withdraw`;
     const dataAllUser=await queryPromises(queryAllUser);

     if(dataAllUser.length==0){
        return res.status(404).json({
          status:"success",
          message:""
        })
     }

    }catch(err){
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to fetch bank details",
            error: err.message
        })
    }
}
const queryPromises = (query, value = []) => {
    return new Promise((resolve, reject) => {
        pool.query(query, value, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        })
    })
}