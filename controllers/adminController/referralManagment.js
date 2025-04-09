

import pool from "../../config/db.js";


export const directReferralAddCoins = async (req, res) => {
    try {
        const { coin } = req.body;
        const queryCheckCoin = `SELECT * FROM direct_referral_coins`
        pool.query(queryCheckCoin, async (err, result) => {
            if (err) {
                return res.status(500).json({
                    status: "error",
                    message: "Something went wrong while trying to check if direct referral coins table exists",
                    error: err.message
                })
            }



            if (result.length == 0) {
                const qeuryPutDIRRefCoin = `INSERT INTO direct_referral_coins (coin,date) VALUES (?,?)`;
                const values = [coin, new Date()];

                pool.query(qeuryPutDIRRefCoin, values, async (err, result) => {
                    if (err) return res.status(500).json({
                        status: "failed",
                        message: "An error occurred while trying to add coins to the user",
                        error: err.message
                    })
                    const queryAddLevle = `INSERT INTO team_referral_coin (level1) VALUES (?)`
                    const value = [coin];
                    const addCoinAtLevel1 = await queryPromise(queryAddLevle, value);
                    res.status(200).json({
                        status: "success",
                        message: "Coins added successfully to the Direct Referral coin",
                    })
                });
            } else {
                const queryAddLevle = `UPDATE team_referral_coin SET level1=? WHERE id=2`
                const value = [coin];
                const addCoinAtLevel1 = await queryPromise(queryAddLevle, value);
                const queryUpdateDirecRef = `UPDATE direct_referral_coins SET coin=? WHERE id=1`;
                const values = [coin];
                pool.query(queryUpdateDirecRef, values, (err, result) => {
                    if (err) return res.status(500).json({
                        status: "failed",
                        message: "An error occurred while trying to update Direct Referral coin",
                        error: err.message
                    })
                    res.status(200).json({
                        status: "success",
                        message: "Coins updated successfully to the Direct Referral coin",
                    })
                })
            }
        })


    } catch (err) {
        return res.status(500).json({
            status: "failed",
            message: "An error occurred while trying to add coins to the user",
            error: err.message
        })
    }
}


export const getDirectReferal = (req, res) => {
    try {
        const queryGetDirRef = `SELECT * FROM direct_referral_coins`
        pool.query(queryGetDirRef, (err, result) => {
            if (err) {
                return res.status(500).json({
                    status: "error",
                    message: "Something went wrong while trying to fetch direct referral coins",
                    error: err.message
                })
            }
            res.status(200).json({
                status: "success",
                message: "Direct Referral coins fetched successfully",
                data: result
            })
        })

    } catch (err) {
        return res.status(500).json({
            status: "failed",
            message: "An error occurred while trying to fetch direct referral coins",
            error: err.message
        })
    }
}


export const teamReferralManagement = async (req, res) => {
    try {
        console.log(req.body)
        const queryDirectReferral = `SELECT * FROM direct_referral_coins`;
        const directReferralData = await queryPromise(queryDirectReferral);
        if (directReferralData.length == 0) {
            return res.status(400).json({
                status: "error",
                message: "you should be add coin in  direct referral",
            })
        }
        const queryCheckData = `SELECT * FROM team_referral_coin `;
        const DataTeamReferral = await queryPromise(queryCheckData);
        if (DataTeamReferral.length == 0) {
            const { level2, level3, level4, level5, level6, level7, level8, level9, level10, level11, level12, level13, level14 } = req.body;
            const queryGetTeamRef = `INSERT INTO team_referral_coin (level1,level2,level3,level4,level5,level6,level7,level8,level9,level10,level11,level12,level13,level14) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
            const values = [directReferralData[0].coin, level2, level3, level4, level5, level6, level7, level8, level9, level10, level11, level12, level13, level14];

            const addTeamRefferals = await queryPromise(queryGetTeamRef, values);
            console.log(addTeamRefferals)
            if (addTeamRefferals.affectedRows == 0) {
                return res.status(400).json({
                    status: "error",
                    message: "Team referral coins are not added",
                })
            }

            return res.status(200).json({
                status: "success",
                message: "Team referral coins are added successfully",
                data: addTeamRefferals
            })
        } else {
            const { level2, level3, level4, level5, level6, level7, level8, level9, level10, level11, level12, level13, level14 } = req.body;
            const queryUpdateTeamRef = `UPDATE team_referral_coin SET level1=?,level2=?,level3=?,level4=?,level5=?,level6=?,level7=?,level8=?,level9=?,level10=?,level11=?,level12=?,level13=?,level14=? WHERE id=2`;
            const values = [directReferralData[0].coin, level2, level3, level4, level5, level6, level7, level8, level9, level10, level11, level12, level13, level14];
            const updateValue = await queryPromise(queryUpdateTeamRef, values);
            if (updateValue.affectedRows == 0) {
                return res.status(400).json({
                    status: "error",
                    message: "Team referral coins are not updated",
                })
            }
            return res.status(200).json({
                status: "success",
                message: "Team referral coins are updated successfully",
                data: updateValue
            })
        }

    } catch (err) {
        return res.status(500).json({
            status: "failed",
            message: "An error occurred while trying to fetch team referral coins",
            error: err.message
        })
    }

}


export const getUserTree=async(req,res)=>{
    try{
         const {userId}=req.params;
         const queryUserDetails=`SELECT team FROM tbl_users WHERE id=?`;
         const value=[userId];
         const dataUserTeam=await queryPromise(queryUserDetails,value);
         const parentTree=[];
         const team=JSON.parse(dataUserTeam[0]?.team)
         for(let i of team){
            const queryDataUser=`SELECT user_id FROM team_referral WHERE id=?`
            const DataUserTeam=[i];
            
            console.log(i);
         }

         return res.status(200).json({
            status:"succes",
            message:"get all details"
         })
    }catch(err){
     return res.status(500).json({
            status: "failed",
            message: "An error occurred while trying to fetch team referral coins",
            error: err.message
        })
    }
} 

export const geTeamReferralCoin = async (req, res) => {
    try {
        const getQueryData = `SELECT * FROM team_referral_coin  `;
        const dataTeamReferral = await queryPromise(getQueryData);
        if (dataTeamReferral.length == 0) {
            return res.status(200).json({
                status: "success",
                message: "No team referral coins found",
            })
        }
        return res.status(200).json({
            status: "success",
            message: "Team referral coins fetched successfully",
            data: dataTeamReferral[0]
        })

    } catch (err) {
        return res.status(500).json({
            status: "failed",
            message: "An error occurred while trying to fetch team referral coins",
            error: err.message
        })
    }
}




export const addDirectPurchased = async (req, res) => {
    try {
        const { directPercentage } = req.body;

        if (!directPercentage) return res.status(400).json({
            status: "error",
            message: "direct percentage is required",
        })
        const queryGetDirRef = `SELECT * FROM direct_purchase`;
        const directReferralData = await queryPromise(queryGetDirRef);
        if (directReferralData.length == 0) {
            console.log("check  this")
            const queryPutDirRefPurchased = `INSERT INTO direct_purchase (direct_precentage,date) VALUES (?)`;
            const values = [directPercentage, new Date()];
            const addDirectPurchased = await queryPromise(queryPutDirRefPurchased, values);
            if (addDirectPurchased.affectedRows == 0) {
                return res.status(400).json({
                    status: "error",
                    message: "direct purchased coins are not added",
                })
            }

            const queryTeamPurchased = `INSERT INTO direct_purchase_team (level1) VALUES (?)`;
            const valuesTeam = [directPercentage];
            const addTeamPurchased = await queryPromise(queryTeamPurchased, valuesTeam);

            return res.status(200).json({
                status: "success",
                message: "direct purchased coins are added successfully",
                data: addDirectPurchased
            })

        } else {
            const queryUpdateDirRefPurchased = `UPDATE direct_purchase SET direct_precentage=?, date=? WHERE id=1`;
            const values = [directPercentage, new Date()];
            const updateDirectPurchased = await queryPromise(queryUpdateDirRefPurchased, values);

            const queryTeamPurchased = `UPDATE direct_purchase_team SET level1=? WHERE id=1 `;
            const valuesTeam = [directPercentage, new Date()];
            const addTeamPurchased = await queryPromise(queryTeamPurchased, valuesTeam);

            if (updateDirectPurchased.affectedRows == 0) {
                return res.status(400).json({
                    status: "error",
                    message: "direct purchased coins are not updated",
                })
            }
            return res.status(200).json({
                status: "success",
                message: "direct purchased coins are updated successfully",
                data: updateDirectPurchased
            })
        }



    } catch (err) {
        return res.status(500).json({
            status: "failed",
            message: "An error occurred while trying to add direct purchased coins",
            error: err.message
        })
    }
}

export const getDirectPurchased = async (req, res) => {
    try {
        const queryGetDirRef = `SELECT * FROM direct_purchase`
        const getQueryData = await queryPromise(queryGetDirRef);
           
        if (getQueryData.length == 0) {
            return res.status(200).json({
                status: "success",
                message: "No direct purchased coins found",
            })
        }
        return res.status(200).json({
            status: "success",
            message: "Direct purchased coins fetched successfully",
            data: getQueryData[0]
        })
    } catch (err) {
        return res.status(500).json({
            status: "failed",
            message: "An error occurred while trying to fetch direct referral coins",
            error: err.message
        })
    }
}

export const addTeamPurchased = async (req, res) => {
    try {
        const { level2, level3, level4, level5, level6, level7, level8, level9, level10, level11, level12, level13, level14 } = req.body;
        const queryGetDirRef = `SELECT * FROM direct_purchase_team`;
        const directTeamReferralData = await queryPromise(queryGetDirRef);
        const queryDirectPurchasedData = `SELECT * FROM direct_purchase`
        const directReferralData = await queryPromise(queryDirectPurchasedData);

        if (directTeamReferralData.length == 0) {
            const queryPutDirRefPurchased = `INSERT INTO direct_purchase_team (level1,level2,level3,level4,level5,level6,level7,level8,level9,level10,level11,level12,level13,level14) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
            const values = [directReferralData[0].direct_precentage, level2, level3, level4, level5, level6, level7, level8, level9, level10, level11, level12, level13, level14];
            const addDirectPurchased = await queryPromise(queryPutDirRefPurchased, values);
            if (addDirectPurchased.affectedRows == 0) {
                return res.status(400).json({
                    status: "error",
                    message: "team purchased coins are not added",
                })
            }
            return res.status(200).json({
                status: "success",
                message: "team purchased coins are added successfully",
                data: addDirectPurchased
            })
        } else {
            const queryUpdateDirRefPurchased = `UPDATE direct_purchase_team SET level1=?, level2=?,level3=?,level4=?,level5=?,level6=?,level7=?,level8=?,level9=?,level10=?,level11=?,level12=?,level13=?,level14=? WHERE id=1`;
            const values = [directReferralData[0].direct_precentage, level2, level3, level4, level5, level6, level7, level8, level9, level10, level11, level12, level13, level14];
            const updateDirectPurchased = await queryPromise(queryUpdateDirRefPurchased, values);
            if (updateDirectPurchased.affectedRows == 0) {
                return res.status(400).json({
                    status: "error",
                    message: "team purchased coins are not updated",
                })
            }
            return res.status(200).json({
                status: "success",
                message: "team purchased coins are updated successfully",
                data: updateDirectPurchased
            })
        }

    } catch (err) {
        return res.status(500).json({
            status: "failed",
            message: "An error occurred while trying to add team purchased coins",
            error: err.message
        })
    }
}

export const getTeamPurchased = async (req, res) => {
    try {
        const queryGetDirRef = `SELECT * FROM direct_purchase_team`
        const getQueryData = await queryPromise(queryGetDirRef);
        if (getQueryData.length == 0) {
            return res.status(200).json({
                status: "success",
                message: "No team purchased coins found",
            })
        }
        return res.status(200).json({
            status: "success",
            message: "Team purchased coins fetched successfully",
            data: getQueryData[0]
        })
    } catch (err) {
        return res.status(500).json({
            status: "failed",
            message: "An error occurred while trying to fetch team purchased coins",
            error: err.message
        })
    }
}
const queryPromise = (query, values = []) => {
    return new Promise((resolve, reject) => {
        pool.query(query, values, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        })
    })
}