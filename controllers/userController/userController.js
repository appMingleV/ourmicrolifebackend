import pool from '../../config/db.js';
import { getMLM } from '../../service/refferralSystem/refferral.js'
import otpGenerator from 'otp-generator'
import { updatePosition, getAllPositonAmount, getTentativeCoin,getProfileCoins } from '../../service/refferralSystem/refferral.js'
import { sendMailForOTP, sendMailWelcomeSignup,adminConfirmationMailtoUser } from '../../service/common/common.js';
import { getTeamPurchased } from '../../service/refferralSystem/refferral.js'
import { otpImplementation } from '../../service/OTPSub/otp.js';
import jwt from 'jsonwebtoken'
const otpStorage = {};
export const userProfileUpdate = (req, res) => {
    try {
        const { userId } = req.params;
        const { firstName, lastName, email } = req.body;
        console.log(userId, firstName, lastName, email)
        if (!firstName && !lastName && !email && !req.file) {
            return res.status(400).json({
                status: "error",
                message: "Please provide at least one field to update"
            })
        }
        const queryUpdate = `UPDATE tbl_users SET first_name=?, last_name=?, email=?, profile_picture=? WHERE id=?`
        const value = [firstName, lastName, email, req?.file?.filename, userId];

        pool.query(queryUpdate, value, (err, result) => {
            if (err) {
                return res.status(500).json({
                    status: "error",
                    message: "Something went wrong while trying to update user profile",
                    error: err.message
                })
            }
            return res.status(200).json({
                status: "success",
                message: "User profile updated successfully",
            })
        })

    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to update user profile",
            error: err.message
        })
    }
}

export const signupController = async (req, res) => {
    try {
    const { first_name, last_name, email, mobile_number, referralCode } = req.body;

    if (!first_name || !last_name || !email || !mobile_number) {
        return res.status(400).json({ message: "All fields except referral code are required." });
    }
    
    const queryCheckUserExist=`SELECT  email,mobile_number FROM  tbl_users WHERE email=? OR mobile_number=?`
    const valueCheckUserExist=[email,mobile_number]
    const checkUserExist=await queryPromise(queryCheckUserExist,valueCheckUserExist)
    if(checkUserExist.length==0){
        const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
        otpStorage[mobile_number] = { first_name, last_name, email, otp }; // Store OTP temporarily
    
        // Send OTP via email (use an actual email service in production)
        const otpData = await otpImplementation(otp, mobile_number,"verification OTP")
        await sendMailForOTP(email,first_name,otp,"verification OTP")
      
        res.status(200).json({ message: "OTP sent successfully!", otp, mobile_number });
    }else
    {
      
        if(checkUserExist[0].email===email){
            res.status(400).json({message:`email already exists `});
        }else{
            res.status(400).json({message:`mobile number already exists `});
        }
    }

    } catch (error) {
        res.status(500).json({ message: "Error sending OTP", error });
    }
}

export const verifyOTP = async (req, res) => {
    const { mobile_number, otp } = req.body;
    try {
        console.log(otpStorage[mobile_number]);
        if (otpStorage[mobile_number] && otpStorage[mobile_number].otp === otp) {
            const token = jwt.sign({ mobile_number }, process.env.JWT_SECRET)
            const querySignup = `INSERT INTO tbl_users (first_name,last_name,email,mobile_number,api_token) VALUES (?,?,?,?,?)`
            const value = [otpStorage[mobile_number].first_name, otpStorage[mobile_number].last_name,otpStorage[mobile_number].email, mobile_number,token];
            const userSet = await queryPromise(querySignup, value);

            if (!userSet) {
                return res.status(400).json({
                    status: "error",
                    message: "server error",

                })
            }
            const queryGetTeam = `SELECT * FROM tbl_users WHERE mobile_number=?`;
            const valueGetTeam = [mobile_number];
            const userDetails=await queryPromise(queryGetTeam, valueGetTeam)
          
            await sendMailWelcomeSignup(otpStorage[mobile_number]?.email, otpStorage[mobile_number]?.first_name,"welcome to Our Microlife");
            delete otpStorage[mobile_number];
            // Remove OTP after successful verification
            return res.status(200).json({ message: "OTP verified successfully!", token, id: userDetails[0]?.id });

        }

        res.status(400).json({ message: "Invalid OTP or OTP expired" });
    } catch (err) {
        return res.status(500).json({ message: "Error verifying OTP", err: err.message });
    }

};

export const login = async (req, res) => {

    try {
        const authData = req.body.email
            ? { email: req.body.email }
            : { mobile: req.body.mobile_number };
      

        if ('email' in authData) {
            const { email } = authData;

            // Check if the email exists in the database
            const queryCheckEmail = `SELECT * FROM tbl_users WHERE email = ?`;
            const emailValue = [email];

            pool.query(queryCheckEmail, emailValue, async (err, result) => {
                if (err) {
         
                    return res.status(500).json({
                        status: "error",
                        message: "Something went wrong while checking the email",
                        error: err.message,
                    });
                }

                if (result.length === 0) {
                    return res.status(404).json({
                        status: "error",
                        message: "Email does not exist ",
                    });
                }

                // Generate OTP and send email
                const otp = generateOtp();

                otpStorage[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // OTP valid for 5 minutes

                await sendMailForOTP(email,result[0]?.first_name, otp,"verification OTP");
                return res.status(200).json({
                    status: "success",
                    message: "OTP sent to email successfully",
                });


            });
        } else {

            const { mobile } = authData;
       
            const queryCheckMobile = `SELECT * FROM tbl_users WHERE mobile_number=?`;
            const Value = [mobile];
            pool.query(queryCheckMobile, Value, async (err, result) => {
                if (err) {
               
                    return res.status(500).json({
                        status: "error",
                        message: "Something went wrong while checking the mobile number",
                        error: err.message,
                    });
                }
                if (result.length === 0) {
                    return res.status(404).json({
                        status: "failed",
                        message: "Mobile number does not exist",
                    })
                }

                const mobileNumber = "+91" + mobile;



                // Generate and store the OTP
                const otp = generateOtp();
                const otpData = await otpImplementation(otp, req.body.mobile_number)
                if (otpData.Status !== 'OK') {
                    return res.status(400).json(otpData);
                }

                otpStorage[mobileNumber] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // OTP expires in 5 minutes




                return res.status(200).json({
                    status: "success",
                    message: "OTP sent to mobile number successfully",
                });

            })


        }
    } catch (err) {
  
        return res.status(500).json({
            status: "failed",
            message: "Something went wrong while trying to send OTP to email",
            error: err.message,
        });
    }
};

export const verifyOtpNumber = async (req, res) => {
    const authData = req.body.email
        ? { email: req.body.email }
        : { mobile: "+91" + req.body.mobile_number };

    const otp = req.body.otp;
 
    if ("email" in authData) {
        const { email } = authData;
        const storedOtpDetails = otpStorage[email];
        if (
            storedOtpDetails &&
            storedOtpDetails.otp === parseInt(otp) &&
            storedOtpDetails.expiresAt > Date.now()
        ) {
            // OTP is valid
            delete otpStorage[email]; // Clear OTP after verification
            const token = jwt.sign({ email }, process.env.JWT_SECRET);

            const queryStoreToken = `UPDATE tbl_users SET  api_token=? WHERE email=?`;
            const values1 = [token, email]
            const userData = await queryPromise(queryStoreToken, values1);
            const queryGetUserId = `SELECT id FROM tbl_users WHERE email=?`;
            const values2 = [email]
            const userId = await queryPromise(queryGetUserId, values2);
            
            return res.json({
                status: "success",
                message: "OTP verified successfully",
                userData,
                token,
                userId: userId[0].id
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
     
        const storedOtpDetails = otpStorage[mobile];
        if (
            storedOtpDetails &&
            storedOtpDetails.otp === parseInt(otp) &&
            storedOtpDetails.expiresAt > Date.now()
        ) {
            // OTP is valid
            delete otpStorage[mobile]; // Clear OTP after verification
            const token = jwt.sign({ mobile }, process.env.JWT_SECRET);
            const queryStoreToken = `UPDATE tbl_users SET  api_token=? WHERE mobile_number=?`;
            const values1 = [token, mobile];
            const userData = await queryPromise(queryStoreToken, values1);
            const queryGetUserId = `SELECT id FROM tbl_users WHERE mobile_number=?`;
            const values2 = [req.body.mobile_number]
            const userId = await queryPromise(queryGetUserId, values2);
        
            return res.status(200).json({
                status: "success",
                message: "OTP verified successfully",
                userId: userId[0].id,
                token
            })
        } else {
            // OTP is invalid or expired
            return res.status(400).json({
                status: "failed",
                message: "Invalid or expired OTP",
            });
        }
    }
};



export const checkReferralActive = async (req, res) => {
    try {
        const { userId } = req.params;
        const queryCheckAmount = `SELECT * FROM  Transition WHERE user_id=?`
        const value = [userId];
        const dataQuery = await queryPromise(queryCheckAmount, value);
        if (dataQuery.length == 0) {
            return res.status(200).json({
                status: "success",
                message: "No transition found",
                refferalStatus: false,
            })
        }

        const MLMStatus = dataQuery[0]?.MLMStatus
        if (!MLMStatus) {
            return res.status(200).json({
                status: "success",
                message: "admin has not been approved",
                refferalStatus: false,
            })
        }

        return res.status(200).json({
            status: "success",
            message: "referral is active",
            refferalStatus: true,
        })
    } catch (err) {
        return res.status(500).json({
            status: "failed",
            message: "Unexpected error occurred",
            error: err.message,
        })
    }
}

function generateOtp() {
    return Math.floor(1000 + Math.random() * 9000);
}
export const singleOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
   
        if (orderId == undefined || orderId == null) return res.status(404).json({
            status: "error",
            message: "Invalid order id",
        })

        const queryOrderItems = `SELECT * FROM order_items WHERE id=?`
        const valueItems = [orderId];
        const dataOrderItems = await queryPromise(queryOrderItems, valueItems);
        if (dataOrderItems.length == 0) {
            return res.status(400).json({
                status: "error",
                message: "No order items found",
            })
        }

        const queryProduct = `SELECT * FROM products WHERE id=?`;
        const valueProduct = [dataOrderItems[0]?.product_id];
        const dataProduct = await queryPromise(queryProduct, valueProduct);
        const queryOrder = `SELECT * FROM  orders_cart WHERE id=?`
        const value = [dataOrderItems[0]?.order_id];
        const dataOrder = await queryPromise(queryOrder, value);
        if (dataOrder.length == 0) {
            return res.status(404).json({
                status: "error",
                message: "Invalid order id",
            })
        }

        const queryUser = `SELECT * FROM  shipping_addresses WHERE id=?`
        const valueUser = [dataOrder[0]?.shipping_address_id];
        const dataUserAddress = await queryPromise(queryUser, valueUser);



        return res.status(200).json({
            status: "success",
            message: "Order details fetched successfully",
            userAddress: dataUserAddress[0] || "not found",
            orderItems: dataOrderItems,
            products: dataProduct
        })

    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Unexpected error occurred",
            error: err.message,
        })
    }
}



// const queryUpdateLevel=`UPDATE tbl_users SET  LEVEl="Sahyogi" WHERE id=?`
//        const valueData=[userId]
//        const updateData=await queryPromise(queryUpdateLevel,valueData);
//         if(!updateData)return res.status(500).json({
//             status:"error",
//             message:"server error",
//         })    
//         const startDate=new Date();
//         const endDate = new Date(new Date().setDate(startDate.getDate() + 30));
//         console.log(endDate);
//         const queryStartMlm=`INSERT INTO mlm_duration (startDate,endDate,coinValue,payOut,userId) VALUE (?,?,?,?,?)`;
//         const valueStartMlm=[startDate,endDate,0,0,userId];
//         await queryPromise(queryStartMlm,valueStartMlm,userId);
//         return res.status(200).json({
//                 status: "success",
//                 message: "MLM  added successfully",
//                 data: dataQuery[0], 
//             })

export const payMLMAmount = async (req, res) => {
    try {
        const { userId } = req.params;
        const { price, transitionId, dateTransaction } = req.body;
        if (!price || !transitionId || !dateTransaction || !req.file.filename) {
            return res.status(400).json({
                status: "error",
                message: "Please provide all fields",
            })
        }
        const queryAddMLMAmount = `INSERT INTO Transition (user_id,TransitionAm,MLMStatus,date_transaction,transition_id,image) VALUE (?,?,?,?,?,?)`
        const value = [userId, price, "pending", dateTransaction, transitionId, req.file.filename];
        const dataQuery = await queryPromise(queryAddMLMAmount, value);
        if (!dataQuery) {
            return res.status(404).json({
                status: "error",
                message: "server error",
            })
        }
        const queryUser=`SELECT * FROM tbl_users WHERE id=?`;
        const userDetails=await queryPromise(queryUser,[userId]);
        const dataUser=userDetails[0];
        adminConfirmationMailtoUser(dataUser.email,dataUser.first_name,dateTransaction,dateTransaction)
        return res.status(200).json({
            status: "success",
            message: "MLM amount added successfully",
            data: dataQuery[0],

        })

    } catch (err) {
        return res.status(500).json({
            status: "failed",
            message: "Unexpected error occurred",
            error: err.message,
        })
    }
}


export const getProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const queryGetProfile = `SELECT * FROM tbl_users WHERE id=?`;
        const value = [userId]
        const dataQuery = await queryPromise(queryGetProfile, value);
        if (dataQuery.length == 0) {
            return res.status(404).json({
                status: "error",
                message: "User not found",
            })
        }
    

        await updatePosition(userId);

        return res.status(200).json({
            status: "success",
            message: "User profile fetched successfully",
            data: dataQuery[0],
        })
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to fetch user profile",
            error: err.message
        })
    }
}


export const addBankDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      account_holder_name,
      account_number,
      confirm_account_number,
      bank_name,
      ifsc_code,
      nominee_name,
      nominee_address,
      nominee_dob,
    } = req.body;

    // Validate required fields
    if (!userId || !account_holder_name || !account_number || !confirm_account_number || !bank_name || !ifsc_code) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields",
      });
    }

    // Check if account_number and confirm_account_number match
    if (account_number !== confirm_account_number) {
      return res.status(400).json({
        status: "error",
        message: "Account number and confirm account number do not match",
      });
    }

    // Check if bank details already exist
    const checkBankDetails = `SELECT * FROM bank_nominee_details WHERE user_id = ?`;
    const values = [userId];
    const bankDetails = await queryPromise(checkBankDetails, values);

    if (bankDetails.length === 0) {
      // Insert new bank details if not found
      const insertQuery = `
        INSERT INTO bank_nominee_details 
        (user_id, account_holder_name, account_number, confirm_account_number, bank_name, ifsc_code, nominee_name, nominee_address, nominee_dob) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
      const insertValues = [
        userId,
        account_holder_name,
        account_number,
        confirm_account_number,
        bank_name,
        ifsc_code,
        nominee_name || null,
        nominee_address || null,
        nominee_dob || null,
      ];

      await queryPromise(insertQuery, insertValues);

      return res.status(201).json({
        status: "success",
        message: "Bank details added successfully",
      });
    } else {
      // Update existing bank details
      const updateQuery = `
        UPDATE bank_nominee_details 
        SET account_holder_name = ?, account_number = ?, confirm_account_number = ?, bank_name = ?, ifsc_code = ?, nominee_name = ?, nominee_address = ?, nominee_dob = ? 
        WHERE user_id = ?`;

      const updateValues = [
        account_holder_name,
        account_number,
        confirm_account_number,
        bank_name,
        ifsc_code,
        nominee_name || null,
        nominee_address || null,
        nominee_dob || null,
        userId,
      ];

      await queryPromise(updateQuery, updateValues);

      return res.status(200).json({
        status: "success",
        message: "Bank details updated successfully",
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Unexpected error occurred",
      error: err.message,
    });
  }
};


export const getBankDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "Invalid user ID",
      });
    }

    // Query to get bank details
    const query = `SELECT * FROM bank_nominee_details WHERE user_id = ?`;
    const values = [userId];
    const bankDetails = await queryPromise(query, values);

    if (bankDetails.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No bank details found for this user",
      });
    }

    return res.status(200).json({
      status: "success",
      data: bankDetails[0], // Returning only the first record (assuming one per user)
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Unexpected error occurred",
      error: err.message,
    });
  }
};



export const getWalletTransactions = async (req, res) => {
    try {
        const { userId } = req.params;
        const querymlmduration = `SELECT * FROM mlm_duration WHERE userId=?`;
        const mlmValue = [userId];
        const mlmDataQuery = await queryPromise(querymlmduration, mlmValue);
        if (mlmDataQuery.length == 0) {
            return res.status(200).json({
                status: "success",
                message: "this user is not part of mlm"
            })
        }
        //history of coin_history---> 
        const queryGetTransactions = `SELECT * FROM coins_history WHERE user_id=?`;
        const value = [userId];
       
        const dataQuery = await queryPromise(queryGetTransactions, value);
       
        const queryCoinUser = `SELECT * FROM  coins WHERE user_id=?`;
        const getUserCoin = await queryPromise(queryCoinUser, [userId]);

        const queryUser = "SELECT * FROM tbl_users WHERE id=?";
        const dataUser = await queryPromise(queryUser, [userId]);

        let coins = getUserCoin[0]?.value;
        let endDate = mlmDataQuery[0]?.endDate;
        let startDate = mlmDataQuery[0]?.startDate;
        console.log("start date is ================> ",startDate);
        console.log("end date is ==================>  ",endDate)
        const currentDate = new Date();
        const positionPaid = dataUser[0].paid_status_;
        const position = dataUser[0].level;
        console.log("=====================>  ",dataQuery)
        const selfPurchasedCoin=dataQuery.filter((element)=>{
            const date=new Date(element?.coin_add_at.split(" ")[0]);
           
          if(element.earning_type=="self" && startDate<=date && endDate>=date ){
             console.log(date);
            return element;
          }   
        })
        console.log("===================>  ",selfPurchasedCoin)
        let coinsSelf=0;
  
        for(let i of selfPurchasedCoin){
            coinsSelf+=i.coin || 0;
        }

        console.log("===================>  ",coinsSelf)
        let getCoin=await getProfileCoins(position);
        let levelEarning=getCoin*(coinsSelf>200?200:coinsSelf);
        let normanEarning=coinsSelf*5;
        console.log(levelEarning);
        console.log(normanEarning)
        const queryUpdateMLMUser = `UPDATE wallets 
                                SET coins = ?, 
                                    payout = ? 
                                WHERE userId = ? AND earning_type = "self"`;
    
       const valueUpdate = [coinsSelf, levelEarning+normanEarning,userId];
    
       await queryPromise(queryUpdateMLMUser, valueUpdate);
       const queryGetGroup=`SELECT * FROM wallets WHERE  userId=? `
       const dataGroup=await queryPromise(queryGetGroup,[userId]);
       const groupEaring=dataGroup[0].payout;
       const referralEaring=dataGroup[1].payout
       
         let totalPayout=0;
         if(endDate<currentDate){
             totalPayout=levelEarning+normanEarning+referralEaring+groupEaring
             const queryUpdateWallet=`UPDATE wallets 
                                SET coins = 0, 
                                    payout =0,
                                
                                WHERE userId = ? AND (earning_type = "self" OR earning_type = "referral" OR earning_type = "group") `
              await queryPromise(queryUpdateWallet,[userId]);
              const updatePayout=`UPDATE wallets 
                                SET coins = 0, 
                                    payout =0,
                                
                                WHERE userId = ? AND (earning_type = "self" OR earning_type = "referral" OR earning_type = "group") `                  
         }
        
      const payOutData=await  queryPromise((`SELECT * FROM payout WHERE user_id=?`),[userId]);
      
       return res.status(200).json({
            status: "success",
            message: "Wallet transactions fetched successfully",
            totalPayout,
            data: dataGroup,
            transition:dataQuery,
            payOutData
        })

    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to fetch wallet transactions",
            error: err.message
        })
    }
}

// function TransitionWallet(){

// }
//  if (coins > 200) {
//             let income = 0;
//             if (!positionPaid) {
//                 const queryCheckUser = `UPDATE tbl_users SET paid_status_=? WHERE id=?`
//                 const dataCheckUser = await queryPromise(queryCheckUser, [true, userId]);
//                 if (!dataCheckUser) return res.status(500).json({
//                     status: "error",
//                     message: "server error",
//                 })
//                 coins -= 200;
//                 const dataPositionPaid = await getAllPositonAmount(position);
//                 income = dataPositionPaid?.income
//                 totalPayout += income
//                 if (income != 0) {
//                     const heading="profile payout is successful add wallet"
//                     const queryAddPayout = `INSERT INTO payout (user_id,amount,heading,coins) VALUES (?,?,?,?)`;
//                     const dataAddPayout = await queryPromise(queryAddPayout, [userId, income,heading,200]);
//                 }
//             }
//             if (coins >= 200) {
//                 const dataTentativeCoins = await getTentativeCoin(position);
//                 let teamPurchasedPercent = await getTeamPurchased();

//                 const tentativeCoins = dataTentativeCoins.coinValue
//                 let totalIncome = (coins * tentativeCoins)
//                 let amount = ((totalIncome) * 80) / 100;
//                 let pfamount = totalIncome - amount;
//                 let teamAmount = 5 * coins;
//                 let payCoin=coins
//                 const teamPurchaesArray = [];
//                 for (let key in teamPurchasedPercent.data) {
//                     teamPurchaesArray.push(teamPurchasedPercent.data[key]);
//                 }
//                 let myTeamAmount = calculateTeamPurchases(teamAmount, userId, teamPurchaesArray);
//                 coins = 0;
//                 totalPayout += amount + myTeamAmount;
 
//                 if (income != 0) {
//                     const heading="The total payout from coin earnings has been paid successfully"
//                     const queryAddPayout = `INSERT INTO payout (user_id,amount,heading,coins) VALUES (?,?,?,?)`;
//                     const dataAddPayout = await queryPromise(queryAddPayout, [userId, amount,heading,payCoin]);
//                 }
//                 if (pfamount != 0) {
//                     const queryAddPfAmount = `INSERT INTO pf_amount  (pfAmount,user_id,withdraw_status) VALUES (?,?,?)`;
//                     const dataAddPfAmount = await queryPromise(queryAddPfAmount, [pfamount, userId, "pending"]);
//                 }
//             }

//             const QueryUpdateMLMPay = `UPDATE mlm_duration SET coinValue=?,payOut=payOut+?,startDate=?,endDate=? WHERE userId=?`
//             endDate = (currentDate + 30);
//             await queryPromise(QueryUpdateMLMPay, [coins, totalPayout, currentDate, endDate, userId]);
//         }

//         await queryPromise(`UPDATE coins SET value=? WHERE user_id=?`, [coins, userId]);

//         const queryPayOut=`SELECT * FROM payout WHERE user_id=?`
//         const valuePay=[userId]
//         const dataPayOut = await queryPromise(queryPayOut, valuePay);

async function calculateTeamPurchases(amount, userId, teamPurchased) {
    const queryTeamId = `SELECT team FROM tbl_users WHERE id=?`
    const value = [userId]

    const dataTeamId = await queryPromise(queryTeamId, value);
    const teamId = JSON.parse(dataTeamId[0].team);

    for (let i = 0; i < teamId.length && i < 14; i++) {
        const queryTeam = `SELECT user_id FROM team_referral WHERE id=?`
   
        const dataTeam = await queryPromise(queryTeam, [teamId[i]]);

        const teamUserId = dataTeam[0].user_id

        const percentageAmount = (amount * teamPurchased[i + 2]) / 100;
    
        const queryAddPayout = `INSERT INTO payout (user_id,amount) VALUES (?,?)`;
        const dataAddPayout = await queryPromise(queryAddPayout, [teamUserId, percentageAmount]);
        const QueryUpsertMLMPay = `
    INSERT INTO mlm_duration (userId, payOut) 
    VALUES (?, ?) 
    ON DUPLICATE KEY UPDATE payOut = payOut + VALUES(payOut)
`;
        await queryPromise(QueryUpsertMLMPay, [teamUserId, percentageAmount]);
    }


    return (amount * teamPurchased[1]) / 100;
}

const queryPromise = async (query, value = []) => {
    return new Promise((resolve, reject) => {
        pool.query(query, value, (err, result) => {
            if (err) {
                reject(err);
            }
            resolve(result);
        })
    })
}