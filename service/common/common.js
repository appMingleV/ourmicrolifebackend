import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
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


export const sendMailForOTP=(email,otp)=>{
    try{
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
  
        const htmlFilePath = path.join(__dirname, 'index.html');
        let emailHtml = fs.readFileSync(htmlFilePath, 'utf8');
        emailHtml = emailHtml.replace('{{OTP}}', otp);
        sendMail(emailHtml,email);
        return {
            status:"success",
            message:"Welcome email sent successfully"
        }
}catch(err){
    return err
}
}

export const sendMailWelcomeSignup=(email,name)=>{
            try{
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = dirname(__filename); 
                const htmlFilePath = path.join(__dirname, 'welcome.html');
                let emailHtml = fs.readFileSync(htmlFilePath, 'utf8');
                emailHtml = emailHtml.replace('{{name}}',name);
                sendMail(emailHtml,email);
                return {
                    status:"success",
                    message:"Welcome email sent successfully"
                }
            }catch(err){
                return err
            }
}



function sendMail(emailHtml,email){
    const transporter = nodemailer.createTransport({
        host: 'smtp.hostinger.com',
        port: 587, // Use port 465 for SSL
        secure: false,
        auth: {
            user: 'info@ourmicrolife.com',
            pass: 'i@2L~6W$UeM4'
        }
    });
    var mailOptions = {
        from: 'info@ourmicrolife.com',
        to: email,
        subject: 'Sending Email ',
        html: emailHtml
      };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}