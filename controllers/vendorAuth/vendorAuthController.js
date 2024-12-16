import twilio from 'twilio';
import nodemailer from 'nodemailer';
import pool from '../../config/db.js';
// import { response } from 'express';
import jwt from 'jsonwebtoken';

const otpStore = [];
const SCERET = process.env.JWT_SECRET
export const signup = (req, res) => {

    try {
        const { ownerName, gender, dob, mobile, email, address, storeName, userName, storeCategory, storeAddress, BusinessContact, aadharNumber, PAN, documentType } = req.body;
        const { aadharNumberFront, aadharNumberBack, PANDocument, DocumentProof } = req.files
        if (ownerName == undefined || gender == undefined || gender=='' || dob == undefined || mobile == undefined || email == undefined || address == undefined || address == undefined || storeName == undefined || userName == undefined || storeAddress == undefined || storeCategory == undefined || aadharNumber == undefined || PAN == undefined || documentType == undefined || aadharNumberFront == undefined || aadharNumberBack == undefined || PANDocument == undefined || DocumentProof == undefined) {
            return res.status(404).json({
                status: "failed",
                message: "All fields are required",
            })
        }
        const queryPersonal = `INSERT INTO  Vendor (ownerName,gender,dob,mobile,email,address) VALUES (?,?,?,?,?,?)`
        const values = [ownerName, gender, dob, mobile, email, address];
        pool.query(queryPersonal, values, (err, result) => {
            console.log(result);
            if (err) {
                return res.status(500).json({
                    status: "error",
                    message: "Something went wrong while trying to signup",
                    error: err.message
                })
            }
            const vendorId = result.insertId;
            const queryshopDetails = "INSERT INTO  vendorStoreDetails (storeName,vendor_id,userName,storeCategory,storeAddress,BusinessContact,logo,banner) VALUES (?,?,?,?,?,?,?,?)";

            const values = [storeName, vendorId, userName, storeCategory, storeAddress, BusinessContact, "uploads/defaultShop/banner.jpg", "uploads/defaultShop/logo.jpg"]
            pool.query(queryshopDetails, values, (err, result) => {
                if (err) {
                    return res.status(500).json({
                        status: "error",
                        message: "Something went wrong while trying to signup",
                        error: err.message
                    })
                }

                const queryKYC = 'INSERT INTO VendorKYCDetails (vendor_id,aadharNumberFront,aadharNumberBack,PANDocument,DocumentProof,aadharNumber,PAN,documentType) VALUES (?,?,?,?,?,?,?,?)'

                const values = [vendorId, aadharNumberFront[0].filename, aadharNumberBack[0].filename, PANDocument[0].filename, DocumentProof[0].filename, aadharNumber, PAN, documentType];
                pool.query(queryKYC, values, (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            status: "error",
                            message: "Something went wrong while trying to signup",
                            error: err.message
                        })
                    }
                    return res.status(200).json({
                        status: "success",
                        message: "User signup successful",
                        vendorId: vendorId
                    })
                })

            })

        })

    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to signup",
            error: err.message
        });
    }

}


function generateOtp() {
    return Math.floor(1000 + Math.random() * 9000);
}

export const otpSend = async (req, res) => {
    try {
        const { mobile_number } = req.body;
        const mobileNumber = "+91" + mobile_number;

        // Twilio credentials from environment variables
        const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
        const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioAccountSID = process.env.TWILIO_ACCOUNT_SID;

        const client = twilio(twilioAccountSID, twilioAuthToken);

        // Generate and store the OTP
        const otp = generateOtp();
        otpStore[mobileNumber] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // OTP expires in 5 minutes

        // Send OTP via Twilio
        const message = await client.messages.create({
            body: `Your OTP is ${otp}`,
            from: twilioNumber,
            to: mobileNumber,
        });

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

export const login = async (req, res) => {
   
    try {
        const authData = req.body.email
            ? { email: req.body.email }
            : { mobile: req.body.mobile_number };
        console.log(authData, "  ", req.body.email);

        if ('email' in authData) {
            const { email } = authData;

            // Check if the email exists in the database
            const queryCheckEmail = `SELECT * FROM Vendor WHERE email = ?`;
            const emailValue = [email];

            pool.query(queryCheckEmail, emailValue, async (err, result) => {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({
                        status: "error",
                        message: "Something went wrong while checking the email",
                        error: err.message,
                    });
                }

                if (result.length === 0) {
                    return res.status(404).json({
                        status: "error",
                        message: "Email does not exist in the database",
                    });
                }

                // Generate OTP and send email
                const otp = generateOtp();
                otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // OTP valid for 5 minutes

                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    secure: true,
                    port: 465,
                    auth: {
                        user: 'vanshdeep703@gmail.com',
                        pass: 'ylql ugtz pouo qihs', // Use an app password for Gmail
                    },
                });

                const mailOptions = {
                    from: 'vanshdeep703@gmail.com',
                    to: email,
                    subject: 'Your OTP Code',
                    text: `Your OTP code is: ${otp}`,
                };

                await transporter.sendMail(mailOptions);

                // Generate a JWT token
                const token = jwt.sign({ email }, process.env.JWT_SECRET);

                const queryStoreToken = `UPDATE Vendor SET  token=? WHERE email=?`;
                const values1 = [token, email]

                pool.query(queryStoreToken, values1, (err, result1) => {
                    if (err) {
                        console.error("Database error:", err);
                        return res.status(500).json({
                            status: "error",
                            message: "Something went wrong while storing token",
                            error: err.message,
                        });
                    }

                    return res.status(200).json({
                        status: "success",
                        message: "OTP sent to email successfully",
                    });

                })

            });
        } else {

            const { mobile } = authData;
            const queryCheckMobile = `SELECT * FROM Vendor WHERE mobile=?`;
            const Value = [mobile];
            pool.query(queryCheckMobile, Value, async (err, result) => {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({
                        status: "error",
                        message: "Something went wrong while checking the mobile number",
                        error: err.message,
                    });
                }
                if (result.length === 0) {
                    return res.status(404).json({
                        status: "failed",
                        message: "Mobile number does not exist in the database",
                    })
                }

                const mobileNumber = "+91" + mobile;

                // Twilio credentials from environment variables
                const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
                const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
                const twilioAccountSID = process.env.TWILIO_ACCOUNT_SID;

                const client = twilio(twilioAccountSID, twilioAuthToken);

                // Generate and store the OTP
                const otp = generateOtp();
                otpStore[mobileNumber] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // OTP expires in 5 minutes

                // Send OTP via Twilio
                const message = await client.messages.create({
                    body: `Your OTP is ${otp}`,
                    from: twilioNumber,
                    to: mobileNumber,
                });
                const token = jwt.sign({ mobile }, process.env.JWT_SECRET);
                const queryStoreToken = `UPDATE Vendor SET  token=? WHERE mobile=?`;
                const values1 = [token, mobile];
                pool.query(queryStoreToken, values1, (err, result1) => {
                    if (err) {
                        console.error("Database error:", err);
                        return res.status(500).json({
                            status: "error",
                            message: "Something went wrong while storing token",
                            error: err.message,
                        });
                    }
                    return res.status(200).json({
                        status: "success",
                        message: "OTP sent to mobile number successfully",
                    });
                })

            })


        }
    } catch (err) {
        console.error("Error in login:", err);
        return res.status(500).json({
            status: "failed",
            message: "Something went wrong while trying to send OTP to email",
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
export const verifyOtpNumber = (req, res) => {
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
        const queryToken = `SELECT token,id FROM Vendor WHERE email=?`;
        const values = [email];
        pool.query(queryToken, values, (err, result) => {
          if (err) {
            return res.status(500).json({
              status: "error",
              message: "Something went wrong while fetching token",
              error: err.message,
            });
          }
  
          if (result.length === 0) {
            return res.status(404).json({
              status: "failed",
              message: "Vendor not found for the given email",
            });
          }
  
          // Extract token from the result
          const token = result[0].token;
  
          return res.json({
            status: "success",
            token: token,
            vendorId:result[0].id,
            message: "OTP verified successfully",
          });
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
        const queryToken = `SELECT token,id FROM Vendor WHERE mobile=?`;
        const values = [mobile.substring(3)];
        pool.query(queryToken, values, (err, result) => {
          if (err) {
            return res.status(500).json({
              status: "error",
              message: "Something went wrong while fetching token",
              error: err.message,
            });
          }
  
          if (result.length === 0) {
            return res.status(404).json({
              status: "failed",
              message: "Vendor not found for the given mobile",
            });
          }
  
          // Extract token from the result
          const token = result[0].token;
  
          return res.json({
            status: "success",
            token: token,
            vendorId:result[0].id,
            message: "OTP verified successfully",
          });
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
  


//vendor details show-->
export const vendorDetails = (req, res) => {
    try {
        const { vendorId } = req.params;
        const queryPersonal = `SELECT * FROM Vendor WHERE  id=${vendorId}`;
        pool.query(queryPersonal, (err, result) => {
            if (err) {
                return res.status(500).json({
                    status: "error",
                    message: "Something went wrong while trying to fetch vendor details",
                    error: err.message
                })
            }
           
            const queryshopDetails = `SELECT * FROM vendorStoreDetails WHERE vendor_id=${vendorId}`
            pool.query(queryshopDetails, (err, result1) => {
                if (err) {
                    return res.status(500).json({
                        status: "error",
                        message: "Something went wrong while trying to fetch vendor details",
                        error: err.message
                    })
                }
                return res.status(200).json({
                    status: "success",
                    message: "Vendor details fetched successfully",
                    statusVendor:result[0].status,
                    data: {
                        vendorPersonalDetails: result[0],
                        vendorShopDetails: result1[0]
                    }
                })
            })
        })
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to fetch vendor details",
            error: err.message
        });
    }

}


