import pool from "../../config/db.js";




export const addSlider = async (req, res) => {
    try {
        const {query}=req.params;
        const { link } = req.body;

        const queryAddSlider = `INSERT INTO sliders (image,link,location) VALUES (?,?,?)`;
        const values = [req.file.filename, link,query];
        const addedSlider = await queryPromis(queryAddSlider, values);

        if (!addedSlider) return res.status(400).json({
            status: "failed",
            message: "Failed to add slider",
        })

        return res.status(200).json({
            status: "success",
            message: "Slider added successfully",
            data: addedSlider,
        })

    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to add slider",
            error: err.message,
        })
    }
}


//get all slider-->
export const allSlider = async (req, res) => {
    try {
        const {query}=req.params;
        const queryAllSlider = `SELECT * FROM sliders WHERE location=?`;
        const allSlider = await queryPromis(queryAllSlider,[query]);

        if (allSlider.length === 0) return res.status(400).json({
            status: "failed",
            message: "No sliders found",
        })
        return res.status(200).json({
            status: "success",
            message: "All sliders fetched successfully",
            data: allSlider,

        })
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to fetch all sliders",
            error: err.message,
        })
    }
}


//delete single sliders
export const deleteSlider = async(req,res)=>{
    try{
       const {sliderId}=req.params;
       const queryDeleteSlider=`DELETE FROM sliders WHERE id=?`;
       const value=[sliderId]
       const deletedSlider=await queryPromis(queryDeleteSlider,value);
       
       if(!deletedSlider) return res.status(400).json({
           status:"failed",
           message:"Failed to delete slider",
       })
       return res.status(200).json({
        status:"success",
        message:"slider deleted successfully",
        sliderId
       })
    }catch(err){
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while trying to delete all sliders",
            error: err.message,
        })
    }
}

const queryPromis = (query, value = []) => {
    return new Promise((resolve, Reject) => {
        pool.query(query, value, (err, result) => {
            if (err) Reject(err);
            resolve(result)
        })
    })
}