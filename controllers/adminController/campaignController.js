import { query } from "express";
import pool from "../../config/db.js";

export const compaignAdd= async(req,res)=>{
    try{
        const {buttonName,link}=req.body;
        const {page,location}=req.params;
        const queryCampaign=`INSERT INTO campaign  (button_name,link,image,page,date,location) VALUES (?,?,?,?,?,?)`
        const value=[buttonName,link,req.file.filename,page,new Date(),location];
        const campaignSet=await queryPromises(queryCampaign,value);
        if(!campaignSet)return res.status(500).json({
            status:"failed",
            message:"Failed to add campaign"
        })
        return res.status(200).json({
            status:"success",
            message:"Campaign added successfully",
            data:campaignSet
        })

    }catch(err){
        return res.status(500).json({
            status:"failed",
            message:"Operation failed",
            error:err.message
        })
    }
}


export const getCampaign=async(req,res)=>{
  try{
    const {page,location}=req.params;
    const queryCampaign=`SELECT id,button_name,link,image,date FROM campaign WHERE page=? AND location=?`;
    const value=[page,location];
    const campaignSet=await queryPromises(queryCampaign,value);
    if(campaignSet.length==0)return res.status(400).json({
        status:"failed",
        message:"No campaign found"
    })
    return res.status(200).json({
        status:"success",
        message:"Campaign fetched successfully",
        data:campaignSet
    })
  }catch(err){
    return res.status(500).json({
        status:"failed",
        message:"Operation failed",
        error:err.message
    })
  }
}

export const updateCampaign = async (req, res) => {
    try {
        const { campaignId } = req.params;
        let { buttonName, link } = req.body;

        // Check if campaign exists
        const queryCampaign = `SELECT button_name, link, image FROM campaign WHERE id = ?`;
        const value = [campaignId];
        const campaignGet = await queryPromises(queryCampaign, value);

        if (!campaignGet || campaignGet.length === 0) {
            return res.status(400).json({
                status: "failed",
                message: "Campaign not found"
            });
        }

        // Use existing values if new ones are not provided
        buttonName = buttonName || campaignGet[0]?.button_name;
        link = link || campaignGet[0]?.link;
        const image = req?.file?.filename || campaignGet[0]?.image;

        // Update campaign
        const queryUpdate = `UPDATE campaign SET button_name = ?, link = ?, image = ? WHERE id = ?`;
        const valueUpdate = [buttonName, link, image, campaignId];
        const updateResult = await queryPromises(queryUpdate, valueUpdate);

        if (!updateResult || updateResult.affectedRows === 0) {
            return res.status(500).json({
                status: "failed",
                message: "Failed to update campaign"
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Campaign updated successfully",
            data: updateResult
        });

    } catch (err) {
        return res.status(500).json({
            status: "failed",
            message: "Operation failed in campaign update",
            error: err.message
        });
    }
};


export const deleteCampaign = async (req, res) => {
    try
    {
        const {campaignId}=req.params;
        const queryDelete=`DELETE FROM campaign WHERE id=?`;
        const deleteResult=await queryPromises(queryDelete,[campaignId]);
        if(!deleteResult)return res.status(400).json({
            status:"failed",
            message:"Campaign not found"
        })

        return res.status(200).json({
            status:"success",
            message:"Campaign deleted successfully"
        })
      

    }catch(err){
        return res.status(500).json({
            status:"failed",
            message:"Operation failed",
            error:err.message
        })
    }
}

const queryPromises=(query,value=[])=>{
    return new Promise((resolve,reject)=>{
        pool.query(query,value,(err,result)=>{
            if(err) reject(err);
            else resolve(result);
        })
    })
}