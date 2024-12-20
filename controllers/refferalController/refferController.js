import { customAlphabet } from 'nanoid';
import crypto from 'crypto';
import pool from '../../config/db.js';
import { resolve } from 'path';
import { ContentInstance } from 'twilio/lib/rest/content/v1/content.js';

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
        if (refferalCode) {
            const referralDetails = await checkReferralCode(refferalCode);

            if (!referralDetails) {
                return res.status(404).json({
                    status: "failed",
                    message: "Invalid or inactive referral code",
                });
            }

            const referredUserId = referralDetails.user_id;

            const directReferral = await setDirectReferral(referredUserId, userId);

            if (!directReferral) {
                return res.status(500).json({
                    status: "failed",
                    message: "Error setting direct referral",
                });
            }
            const Teams = await setTeam(referredUserId, userId)

            await addCoins(userId, 50); // Add coins for the new user
            await addCoins(referredUserId, 50); // Add coins for the referrer
        } else {
            // Add coins for a new user without referral
            await addCoins(userId, 50);


        }

        // Generate referral code and link
        const referralCode = generateReferralCode();
        const { encryptedData, iv: ivHex } = encrypt(referralCode);
        const referralLink = `${req.protocol}://${req.headers.host}/signup-user?ref=${encryptedData}&iv=${ivHex}`;

        const newReferral = await createReferral(referralLink, referralCode, userId);

        return res.status(200).json({
            status: "success",
            message: "Referral successfully created",
            data: newReferral.insertId,
        });
    } catch (err) {
        return res.status(500).json({
            status: "failed",
            message: "Unexpected error occurred",
            error: err.message,
        });
    }
};

// Check referral code validity
const checkReferralCode = (referralCode) => {
    const query = `SELECT * FROM refferal WHERE referral_code = ? AND referral_status = 'active'`;
    return new Promise((resolve, reject) => {
        pool.query(query, [referralCode], (err, results) => {
            if (err) return reject(err);
            resolve(results.length > 0 ? results[0] : null);
        });
    });
};

// Set direct referral
const setDirectReferral = (referralFrom, referralTo) => {
    const query = `INSERT INTO direct_referrals (referral_from, referral_to, date, status, coin, coins_transfer) VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [referralFrom, referralTo, new Date(), "active", 50, true];

    return new Promise((resolve, reject) => {
        pool.query(query, values, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

// Add coins to user
const addCoins = (userId, value) => {
    const query = `SELECT value FROM coins WHERE user_id = ?`;
    const values = [userId];

    return new Promise((resolve, reject) => {

        pool.query(query, values, (err, result) => {
            if (err) return reject(err);
            if (result.length === 0) {
                const insertQuery = `INSERT INTO coins (user_id, value) VALUES (?,?)`;
                const insertValues = [userId, value];
                pool.query(insertQuery, insertValues, (err, insertResult) => {
                    if (err) return reject(err);
                    resolve(insertResult);
                });
            } else {

                const updateQuery = `UPDATE coins SET value=value+? WHERE userid_=?`;
                const updateValues = [value + result[0].value, userId];
                pool.query(updateQuery, updateValues, (err, updateResult) => {
                    if (err) return reject(err);
                    resolve(updateResult);
                });
            }

            resolve(result);
        });
    });
};

// Create referral entry
const createReferral = (referralLink, referralCode, userId) => {
    const query = `INSERT INTO refferal (referral_link, referral_code, referral_status, user_id) VALUES (?, ?, ?, ?)`;
    const values = [referralLink, referralCode, "active", userId];

    return new Promise((resolve, reject) => {
        pool.query(query, values, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};
const refferalTeam = [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
const setTeam = async (referredUserId, userId) => {
    try {
        // Insert the new user's referral information
        const querySetTeam = `INSERT INTO team_referral (user_id, status, coins, date, teams) VALUES (?, ?, ?, ?, ?)`;
        const value = [referredUserId, "active", 50, new Date(), JSON.stringify([userId])];
        const teamInsertResult = await queryPromise(querySetTeam, value);

        // Retrieve parent team information
        const queryParentRef = `SELECT team FROM tbl_users WHERE id = ?`;
        const parentResult = await queryPromise(queryParentRef, [referredUserId]);

        const parentTeams = parentResult[0]?.team ? JSON.parse(parentResult[0].team) : [];

        if (parentTeams.length === 0) {
            // Parent has no team yet, initialize with the current user's team
            const queryPutTeam = `UPDATE tbl_users SET team = ? WHERE id = ?`;
            await queryPromise(queryPutTeam, [JSON.stringify([teamInsertResult.insertId]), userId]);
            return teamInsertResult;
        }

        // Update parent teams and propagate changes
        const updatedTeams = [teamInsertResult.insertId, ...parentTeams];

        // Update the parent user's team with new entries
        const queryUpdateNewUserParent = `UPDATE tbl_users SET team = ? WHERE id = ?`;
        await queryPromise(queryUpdateNewUserParent, [JSON.stringify(updatedTeams), userId]);

        // Add new user to all parent teams in the hierarchy
        for (const parentId of parentTeams) {
            const queryTeamSearch = `SELECT teams FROM team_referral WHERE id= ?`;
            const teamSearchResult = await queryPromise(queryTeamSearch, [parentId]);

            const currentTeams = teamSearchResult[0]?.teams ? JSON.parse(teamSearchResult[0].teams) : [];
            if (!currentTeams.includes(userId)) {
                currentTeams.push(userId);

                const queryPutTeamUnique = `UPDATE team_referral SET teams = ? WHERE id= ?`;
                await queryPromise(queryPutTeamUnique, [JSON.stringify(currentTeams), parentId]);
            }
        }

        return teamInsertResult;
    } catch (err) {

        throw err;
    }
};

export const getCheckRefferalCode = (req, res) => {
    try {
        const decryptedRefferalCode = req.decrypt;

        return res.status(200).json({
            status: "success",
            message: "Referral code is valid",
            data: decryptedRefferalCode,
        })

    } catch (err) {
        return res.status(500).json({
            status: "failed",
            message: "Unexpected error occurred",
            error: err.message,
        })
    }
}


export const signupWithReferralCode = async (req, res) => {
    try {
        const { referral_code, new_user_id } = req.body;
        const referralDetails = await checkReferralCode(referral_code);
        if (!referralDetails) {
            return res.status(404).json({
                status: "failed",
                message: "Invalid referral code",
                error: "Referral code not found",
            })
        }
        const referredUserId = referralDetails.user_id;
        const directReferral = await setDirectReferral(referredUserId, new_user_id);

        if (!directReferral) {
            return res.status(500).json({
                status: "failed",
                message: "Failed to set direct referral",
                error: "Failed to set direct referral",
            })
        }

        const teams = await setTeam(referredUserId, new_user_id);
        await addCoins(new_user_id, 50); // Add coins for the new user
        await addCoins(referredUserId, 50); // Add coins for the 

        const referralCodeNewUser = generateReferralCode();
        const { encryptedData, iv: ivHex } = encrypt(referralCodeNewUser);
        const referralLink = `${req.protocol}://${req.headers.host}/signup-user?ref=${encryptedData}&iv=${ivHex}`;

        const newReferral = await createReferral(referralLink, referralCodeNewUser, new_user_id);

        return res.status(200).json({
            status: "success",
            message: "Referral successfully created",
            data: newReferral.insertId,
        });

    } catch (err) {
        return res.status(500).json({
            status: "failed",
            message: "Unexpected error occurred",
            error: err.message,
        })
    }
}



//get Referral users 
export const getRefferalUsers = async (req, res) => {
    try {
        const { userId, query } = req.params;


        if (query == 'all') {
            //all typeRefferal get-->
            const getRefferalUsers = await directReferrals(userId);

            const teamData = await getTeams(userId);
            return res.status(200).json({
                status: "success",
                message: "All referral users fetched",
                data: { directReferral: getRefferalUsers, teamReferral: teamData }
            })

        } else if (query == 'directReferral') {
            const referralData = await directReferrals(userId);
            return res.status(200).json({
                status: "success",
                message: "Direct referral users fetched",
                data: referralData
            })
        } else {
            const teamData = await getTeams(userId);
            return res.status(200).json({
                status: "success",
                message: "Team referral users fetched",
                data: teamData
            })
        }

    } catch (err) {
        return res.status(500).json({
            status: "failed",
            message: "Operation failed",
            error: err.message
        })
    }
}

// function getTeamName(userId){
//   const teamName=
// }

function getDirectRefferalUsers(userId) {
    const queryDirectReferral = `SELECT referral_to,date FROM direct_referrals WHERE referral_from=?`;
    const value = [userId];
    return new Promise((resolve, reject) => {
        pool.query(queryDirectReferral, value, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        })
    })

}
function directReferrals(userId) {
    return new Promise(async (resolve, reject) => {
        const directRefferalUsers = await getDirectRefferalUsers(userId);


        const { objTeamData, objUserTeam, objDirectRefferal } = await getUserProfileRefferalUsers(directRefferalUsers);


        const successData = [];
        for (let i = 0; i < objTeamData.length; i++) {

            const userName = objUserTeam[i][0].first_name + " " + objUserTeam[i][0]?.last_name;
            const level = objUserTeam[i][0]?.level;
            const status = objUserTeam[i][0]?.status;
            const teams = objTeamData[i].length;
            const date = directRefferalUsers[i].date
            let totalMembers = 0;
            for (let teamMember of objTeamData[i]) {
                totalMembers += JSON.parse(teamMember.teams).length;
            }
            const totalUser = totalMembers;
            const directRefMembers = objDirectRefferal[i].length;
            successData.push({
                userName,
                level,
                status,
                teams,
                totalUser,
                date,
                directRefMembers
            })

        }
        resolve(successData)
    })

}


function getTeams(userId) {
    return new Promise(async (resolve, reject) => {
        const teamQuery = `SELECT teams,coins,date FROM team_referral WHERE user_id =?`
        const value = [userId]
        const teamData = await queryPromise(teamQuery, value);
        const objRef = [];

        for (let key of teamData) {

            const obj = {
                teamName: userId + key.coins + Math.floor(Math.random() * 100),
                coins: key.coins,
                team: JSON.parse(key?.teams)
            }
            objRef.push(obj);
        }
        resolve(objRef);
    })
}
function getUserProfileRefferalUsers(directRefferalUsers) {

    return new Promise(async (resolve, reject) => {
        const objTeamData = [];
        const objUserTeam = [];
        const objDirectRefferal = [];
        for (let directRef of directRefferalUsers) {
            //directRef--> { referral_to: 27 }
            //direct RefferalUser Profile--->
            const queryUserPorfile = `SELECT first_name, last_name,level,status FROM  tbl_users WHERE id=?`;
            const value = [directRef.referral_to];
            const profileData = await queryPromise(queryUserPorfile, value);
            // direct refferal user Profile Team--->
            const queryUserTeam = `SELECT teams FROM team_referral  WHERE user_id=?`;

            const teamData = await queryPromise(queryUserTeam, value);
            // console.log("team data ",teamData,"profile data ",profileData);

            //direct refferal users -->
            const queryDirectReferralUser = `SELECT referral_to FROM direct_referrals WHERE referral_from=?`;
            const queryDirectReferal = await queryPromise(queryDirectReferralUser, value);
            objUserTeam.push(profileData);
            objTeamData.push(teamData);
            objDirectRefferal.push(queryDirectReferal);
        }

        resolve({ objTeamData, objUserTeam, objDirectRefferal });
    })

}
// Utility function to promisify pool.query
const queryPromise = (query, values = []) => {
    return new Promise((resolve, reject) => {
        pool.query(query, values, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

export const getRefferalUser = (req, res) => {
    const { userId } = req.params;
    try {
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
                status: "success",
                message: "operation successful",
                Data: result
            })

        });
    } catch (err) {
        return res.status(500).json({
            status: "failed",
            message: "Operation failed",
            error: err.message
        })
    }
}






//    refferal direct user [
//     [
//       RowDataPacket {
//         first_name: 'anki',
//         last_name: 'sha',
//         level: null,
//         status: 1
//       }
//     ],
//     [
//       RowDataPacket {
//         first_name: 'ankit',
//         last_name: 'askjbd',
//         level: null,
//         status: 1
//       }
//     ]
//   ]
//   refferal direct direct [ [ RowDataPacket { referral_to: 28 } ], [] ]