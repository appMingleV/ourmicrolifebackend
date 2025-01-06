export const dateDetails=()=>{
    try{
        const now = new Date();

        // Extract day, month, year
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const year = now.getFullYear();
      
        // Extract hours, minutes, seconds
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
      
        // Format as day/month/year time
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

    }catch(err){
        return res.status(500).json({
            status:"failed",
            message:"operation failed",
            error:err.message
        })
    }
}