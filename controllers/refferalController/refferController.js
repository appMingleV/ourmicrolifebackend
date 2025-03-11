import { customAlphabet } from 'nanoid';
import { directReferralCoin,teamReferralCoin,teamDistrubutionPayOut,addTransactions,currencyValues } from '../../service/refferralSystem/refferral.js'
import crypto from 'crypto';
import pool from '../../config/db.js';

// Define characters for generating referral code
let characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';


// AES encryption algorithm details
const algorithm = 'aes-256-cbc';



// Generate a 10-character referral code
const generateReferralCode = customAlphabet(characters, 10);

//get direct referral system-->


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
export const refferalCreate = async (refferalCode,userId) => {
    try {
        //get direct referal coin
        const directRefCoin = await directReferralCoin();
        const coin =  0;
        if (refferalCode) {
            const referralDetails = await checkReferralCode(refferalCode);
            if (!referralDetails) {
                return false
            }

            const referredUserId = referralDetails.user_id;

            const directReferral = await setDirectReferral(referredUserId, userId,50);

            if (!directReferral) {
                return false
            }
            //team fetch coins--->
            const getCoins =await teamReferralCoin();
            
            const coinsTeam=getCoins.data        
             
            const Teams = await setTeam(referredUserId, userId, coinsTeam)
            addCoins(referredUserId,50)
        } else {
            // Add coins for a new user without referral
            await addCoins(userId,0);


        }

        // Generate referral code and link
        const referralCode = generateReferralCode();
        const { encryptedData, iv: ivHex } = encrypt(referralCode);
        const referralLink = `https://ourmicrolife.com/signup-user?ref=${encryptedData}&iv=${ivHex}`;

        const newReferral = await createReferral(referralLink, referralCode, userId);

        return false
    } catch (err) {
        return false
    }
};


export const getPositionRewards=async (req,res)=>{
    try{
      const   queryGetPositionMLM=`SELECT * FROM phases`;
      const dataGetMLM=await queryPromise(queryGetPositionMLM);
      if(dataGetMLM.length==0){
        return res.status(200).json({
            status: "success",
            message: "No position rewards found",
        })
      }
      return res.status(200).json({
        status: "success",
        message: "Position rewards fetched successfully",
        data: dataGetMLM,
      });
    }catch(err){
        return res.status(500).json({
            status: "failed",
            message: "Unexpected error occurred",
            error: err.message,
        });
    }
}
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
const setDirectReferral = async (referralFrom, referralTo,coin) => {
    const queryCheck = 'SELECT referral_from,referral_to FROM direct_referrals WHERE referral_to=?'
    const value = [referralTo];
    const dataCheck = await queryPromise(queryCheck, value);
    if (dataCheck.length != 0) return false;
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
                console.log("user id ", userId);
                const insertQuery = `INSERT INTO coins (user_id, value) VALUES (?,?)`;
                const insertValues = [userId, value];
                pool.query(insertQuery, insertValues, (err, insertResult) => {
                    if (err) return reject(err);
                    resolve(insertResult);
                });
            } else {
                console.log("referral is working. userId is ", userId, "referral is result ", result)
                const updateQuery = `UPDATE coins SET value=? WHERE user_id=?`;
                let ga = +result[0].value;
                ga += value;
                console.log(ga, "user id ", userId);
                const updateValues = [`${ga}`, userId];
                pool.query(updateQuery, updateValues, (err, updateResult) => {
                    console.log("now add coin referral ", err);
                    if (err) return reject(err);
                    console.log("now add coin referral ", err);
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
const setTeam = async (referredUserId, userId,coinsTeam) => {
    try {
        
        // Insert the new user's referral information
        const querySetTeam = `INSERT INTO team_referral (user_id, status, coins, date, teams) VALUES (?, ?, ?, ?, ?)`;
        const value = [referredUserId, "active", 0, new Date(), JSON.stringify([userId])];
        const teamInsertResult = await queryPromise(querySetTeam, value);

        // Retrieve parent team information-
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
        putCoins(coinsTeam,updatedTeams);
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
// //coins --> [
//     2, 35,  2,  3,  4,  5,
//     7,  8,  9, 10, 12, 16,
//    17, 18, 20
//  ]
const putCoins = async (coinsTeam, teamId) => {
    console.log("coinsTeam=======>     ",coinsTeam)
    const coins = Object.values(coinsTeam);
    console.log("coins -->", coins);
    console.log("teamId -->", teamId);
    try {
      if (teamId.length <= 14) {
        console.log("team is less than 14");
        for (let i = 0; i < teamId.length; i++) {
          const queryTeamHead = `SELECT user_id FROM team_referral WHERE id=?`;
          const valuesTeam = [teamId[i]];
          const dataUserId = await queryPromise(queryTeamHead, valuesTeam);
          if (dataUserId.length > 0) {
            const queryGetCoins=`SELECT value FROM coins WHERE user_id=?`
            const valueCoin=[dataUserId[0].user_id];
            const dataCoin=await queryPromise(queryGetCoins,valueCoin);
            
            const valueUser=0;
            console.log("in value get ",valueUser);
            const queryPutCoins = `UPDATE coins SET value=value+? WHERE user_id=?`;
            const values = [0, dataUserId[0].user_id];
            await queryPromise(queryPutCoins, values);
            
            const queryAddCoins = `UPDATE team_referral SET coins=? WHERE id=?`;
            await queryPromise(queryAddCoins, [0, teamId[i]]);
          } else {
            console.error(`No user found for team ID: ${teamId[i]}`);
          }
        }
      } else {
        let count = 14;
        for (let i = teamId.length - 1; i > teamId.length - 15; i--) {
          const queryTeamHead = `SELECT user_id FROM team_referral WHERE id=?`;
          const valuesTeam = [teamId[i]];
          const dataUserId = await queryPromise(queryTeamHead, valuesTeam);
  
          if (dataUserId.length > 0) {
            const queryPutCoins = `UPDATE coins SET value=value+? WHERE user_id=?`;
            const values = [0, dataUserId[0].user_id];
            await queryPromise(queryPutCoins, values);
  
            const queryAddCoins = `UPDATE team_referral SET coins=coins+? WHERE id=?`;
            await queryPromise(queryAddCoins, [0, teamId[i]]);
            count--;
          } else {
            console.error(`No user found for team ID: ${teamId[i]}`);
          }
        }
      }
    } catch (error) {
      console.error("Error in putCoins:", error);
      throw error;
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
        const getCoins =await teamReferralCoin();
        const coinsTeam=getCoins.data      
        const teams = await setTeam(referredUserId, new_user_id,coinsTeam);
        const referralCodeNewUser = generateReferralCode();
        const getDirectReferral=await directReferralCoin();
        console.log("get direct referral system=======================================>",getDirectReferral);
        const directRefCoin=getDirectReferral?.data[0]?.coin
        addCoins(referredUserId,directRefCoin);
        const currency=await currencyValues()
      
        await selfPurchased(userId,currency*directRefCoin,directRefCoin,"referral","referral Earning")
  
        await teamDistrubutionPayOut(referredUserId,directRefCoin*currency,directRefCoin,"referral","team referral payout");
        // await addTransactions("referral coin",directRefCoin,referredUserId,directReferral.insertId,"referral")
        
        const { encryptedData, iv: ivHex } = encrypt(referralCodeNewUser);
        const referralLink = `${req.protocol}://ourmicrolife.com/signup-user?ref=${encryptedData}&iv=${ivHex}`;
        
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
            console.log("team is  ")
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
    console.log(userId);
    return new Promise((resolve, reject) => {
        pool.query(queryDirectReferral, value, (err, result) => {
            console.log("heell safafjj  ",result)
            if (err) return reject(err);
            resolve(result);
        })
    })

}
function directReferrals(userId) {
    return new Promise(async (resolve, reject) => {
        const directRefferalUsers = await getDirectRefferalUsers(userId);


        const { objTeamData, objUserTeam, objDirectRefferal } = await getUserProfileRefferalUsers(directRefferalUsers);

       console.log("check teeam data=====================> ",directRefferalUsers)
        const successData = [];
        for (let i = 0; i < objTeamData?.length; i++) {

            const userName = objUserTeam[i][0]?.first_name + " " + objUserTeam[i][0]?.last_name;
            const level = objUserTeam[i][0]?.level;
            const status = objUserTeam[i][0]?.status;
            const image= objUserTeam[i][0]?.profile_picture
            const teams = objTeamData[i]?.length;
            const date = directRefferalUsers[i]?.date
            const MLMStatus=objUserTeam[i][0]?.MLMStatus
            let totalMembers = 0;
            for (let teamMember of objTeamData[i]) {
                totalMembers += JSON.parse(teamMember?.teams)?.length;
            }
            const totalUser = totalMembers;
            const directRefMembers = objDirectRefferal[i]?.length;
            successData.push({
                userName,
                level,
                status,
                teams,
                totalUser,
                image,
                date,
                MLMStatus,
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
        console.log("user Id is ",userId);
        const teamData = await queryPromise(teamQuery, value);
        const objRef = [];
        console.log(teamData);
        if(teamData.length===0){
            return 
        }

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
            
            const queryUserPorfile = `SELECT first_name,last_name,level,status,profile_picture,MLMStatus FROM  tbl_users WHERE id=?`;
            const value = [directRef?.referral_to];
            const profileData = await queryPromise(queryUserPorfile, value);
            // direct refferal user Profile Team--->
            console.log("direct referral ---> ",directRef.referral_to)
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