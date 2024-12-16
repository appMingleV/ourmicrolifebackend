import { customAlphabet } from 'nanoid';
import crypto from 'crypto';
import pool from '../../config/db.js';

// Define characters for generating referral code
const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'microlife';

// AES encryption algorithm details
const algorithm = 'aes-256-cbc';

// Generate a 10-character referral code
const generateReferralCode = customAlphabet(characters, 10);

// Encryption function
const encrypt = (text) => {
    const key = Buffer.from(process.env.REFFKEY, 'hex'); // Convert hex to binary

    if (key.length !== 32) {
        throw new Error("Invalid key length. Must be exactly 32 bytes.");
    }

    const iv = crypto.randomBytes(16); // Generate a new IV for each encryption
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
        encryptedData: encrypted,
        iv: iv.toString('hex') // Include IV for decryption
    };
};

// Referral creation logic
export const refferalCreate = async (req, res) => {
    const { userId } = req.params; // Assuming `userId` comes from request params
    const refferalCode = req.decrypt; // Assuming decrypted referral code exists

    try {
        // Handle referral logic
        if (refferalCode) {
            const queryCheckRefferalCode = `SELECT * FROM refferal WHERE referral_code = ? AND referral_status = 'active'`;

            pool.query(queryCheckRefferalCode, [refferalCode], (err, result) => {
                if (err) {
                    return res.status(500).json({
                        status: "failed",
                        message: "Error validating referral code",
                        error: err.message
                    });
                }

                if (!result.length || !result[0].user_id) {
                    return res.status(404).json({
                        status: "failed",
                        message: "Invalid or inactive referral code"
                    });
                }

                const referredUserId = result[0].user_id;
                
                // Add coins for the referred user
                const queryInsertCoins = `INSERT INTO coins (user_id, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = value + ?`;
                const values = [userId, 50, 50];

                pool.query(queryInsertCoins, values, (err) => {
                    if (err) {
                        return res.status(500).json({
                            status: "failed",
                            message: "Error adding coins",
                            error: err.message
                        });
                    }

                    // Update coins for the referral source user
                    const queryUpdateCoins = `UPDATE coins SET value = value + ? WHERE user_id = ?`;
                    pool.query(queryUpdateCoins, [50, referredUserId], (err) => {
                        if (err) {
                            return res.status(500).json({
                                status: "failed",
                                message: "Error updating referral coins",
                                error: err.message
                            });
                        }

                        return res.status(200).json({
                            status: "success",
                            message: "Referral successfully processed"
                        });
                    });
                });
            });
        } else {
            // Add coins for a new user without referral
            const queryInsertCoins = `INSERT INTO coins (user_id, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = value + ?`;
            const values = [userId, 50, 50];

            pool.query(queryInsertCoins, values, (err) => {
                if (err) {
                    return res.status(500).json({
                        status: "failed",
                        message: "Error adding coins",
                        error: err.message
                    });
                }

                console.log("Successfully added user without referral");
            });
        }

        // Generate referral code and link
        const referralCode = generateReferralCode();
        const { encryptedData, iv: ivHex } = encrypt(referralCode);
        const referralLink = `${req.protocol}://${req.headers.host}/signup-user?ref=${encryptedData}&iv=${ivHex}`;

        const queryInsertReferral = `INSERT INTO refferal (referral_link, referral_code, referral_status, user_id) VALUES (?, ?, ?, ?)`;
        const values = [referralLink, referralCode, 'active', userId];

        pool.query(queryInsertReferral, values, (err, result) => {
            if (err) {
                return res.status(500).json({
                    status: "failed",
                    message: "Error creating referral",
                    error: err.message
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Referral successfully created",
                data: result.insertId
            });
        });
    } catch (err) {
        return res.status(500).json({
            status: "failed",
            message: "Unexpected error occurred",
            error: err.message
        });
    }
};


export const getRefferalUser=(req,res)=>
    {
        const {userId}=req.params;
      try{
        const queryGetRefferalUser = `SELECT * FROM refferal WHERE user_id=${userId} AND referral_status = 'active'`;
        pool.query(queryGetRefferalUser, (err, result) => {
            if (err) {
                return res.status(500).json({
                    status: "failed",
                    message: "Operation failed",
                    error: err.message
                });
            }

            return res.status(200).json({
                status:"success",
                message:"operation successful",
                Data:result
            })
        
        });
      }catch(err){
        return res.status(500).json({
            status: "failed",
            message: "Operation failed",
            error: err.message
        })
      }
    }