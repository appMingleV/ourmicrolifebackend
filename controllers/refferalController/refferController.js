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
    const refferalCode = req.decrypt; // Check if `decrypt` exists in the request

    try {
        if (refferalCode) {
            const queryCheckRefferalCode = `SELECT * FROM refferal WHERE referral_code = ? AND referral_status = 'active'`;
            pool.query(queryCheckRefferalCode, [refferalCode], (err, result) => {
                if (err) {
                    return res.status(500).json({
                        status: "failed",
                        message: "Invalid referral code",
                        error: err.message
                    });
                }

                if (!result.length || !result[0].user_ID) {
                    return res.status(404).json({ status: "failed", message: "User not found" });
                }

                const queryInsertCoins = `INSERT INTO coins (user_id, value) VALUES (?, ?)`;
                const values = [userId, 50];

                pool.query(queryInsertCoins, values, (err) => {
                    if (err) {
                        return res.status(500).json({
                            status: "failed",
                            message: "Operation failed",
                            error: err.message
                        });
                    }

                    const queryGetCoins = `SELECT value FROM coins WHERE user_id = ?`;
                    pool.query(queryGetCoins, [result[0].user_ID], (err, result2) => {
                        if (err || !result2.length) {
                            return res.status(500).json({
                                status: "failed",
                                message: "Operation failed",
                                error: err?.message || "No coins found"
                            });
                        }

                        const newValue = result2[0].value + 50;
                        const queryUpdateCoins = `UPDATE coins SET value = ? WHERE user_id = ?`;
                        pool.query(queryUpdateCoins, [newValue, result[0].user_ID], (err) => {
                            if (err) {
                                return res.status(500).json({
                                    status: "failed",
                                    message: "Operation failed",
                                    error: err.message
                                });
                            }

                            return res.status(200).json({
                                status: "success",
                                message: "Referral successfully added",
                            });
                        });
                    });
                });
            });
        } else {
            const queryInsertCoins = `INSERT INTO coins (user_id, value) VALUES (?, ?)`;
            const values = [userId, 50];

            pool.query(queryInsertCoins, values, (err) => {
                if (err) {
                    return res.status(500).json({
                        status: "failed",
                        message: "Operation failed",
                        error: err.message
                    });
                }

                console.log("Successfully added user without referral");
            });
        }

        // Generate referral code
        const referralCode = generateReferralCode();

        // Encrypt the referral code
        const { encryptedData, iv: ivHex } = encrypt(referralCode);

        // Generate referral link
        const referralLink = `${req.protocol}://${req.headers.host}/signup-user?ref=${encryptedData}&iv=${ivHex}`;
        const queryInsertReferral = `INSERT INTO refferal (referral_link, referral_code, referral_status, user_id) VALUES (?, ?, ?, ?)`;
        const values = [referralLink, referralCode, 'active', userId];

        pool.query(queryInsertReferral, values, (err, result) => {
            if (err) {
                return res.status(500).json({
                    status: "failed",
                    message: "Operation failed",
                    error: err.message
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Referral successfully added",
                data: result.insertId // Return the inserted record ID
            });
        });
    } catch (err) {
        return res.status(500).json({
            status: "failed",
            message: "Operation failed",
            error: err.message
        });
    }
};
