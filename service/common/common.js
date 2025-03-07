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


export const sendMailForOTP=(email,name,otp,subject)=>{
    try{
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        console.log("send email to ")
        const htmlFilePath = path.join(__dirname, 'index.html');
        let emailHtml = fs.readFileSync(htmlFilePath, 'utf8');
        emailHtml = emailHtml.replace('{{OTP}}', otp).replace("{{name}}",name)        
        sendMail(emailHtml,email,subject);
        return {
            status:"success",
            message:"Welcome email sent successfully"
        }
}catch(err){
    return err
}
}

export const sendMailPaymentAprovalMLM=async (email,name,subject,referralCode,transactionId,PaymentDate,referral_link)=>{
     try{
        const __filename = fileURLToPath(import.meta.url);
          const __dirname = dirname(__filename); 
        const htmlFilePath = path.join(__dirname, 'paymentApproval.html');
        let emailHtml = fs.readFileSync(htmlFilePath, 'utf8');
        emailHtml = emailHtml.replace('{{name}}',name)
        .replace('{{referralCode}}',referralCode).replace('{{transactionId}}',transactionId).replace('{{PaymentDate}}',PaymentDate)
        sendMail(emailHtml,email,subject);
        // const htmlFilePath234 = path.join(__dirname, 'mlmPositionConfiremed.html');
        // htmlFilePath234=htmlFilePath234.replace('{{referralLink}}',referral_link)
       await sendMailMLMPosition(email,name,referral_link)
        //  sendMail(htmlFilePath234,email,"MLM position confirmed")
     }catch(err){
         return err
     }
}
export const sendMailWelcomeSignup=(email,name,subject)=>{
            try{
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = dirname(__filename); 
                const htmlFilePath = path.join(__dirname, 'welcome.html');
                let emailHtml = fs.readFileSync(htmlFilePath, 'utf8');
                emailHtml = emailHtml.replace('{{name}}',name);
                sendMail(emailHtml,email,subject);
                return {
                    status:"success",
                    message:"Welcome email sent successfully"
                }
            }catch(err){
                return err
            }
}


export const sendMailMLMPosition=(email,name,referralLink)=>{
       try{
        console.log("referral   link: " + referralLink)
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename); 
        const htmlFilePath = path.join(__dirname, 'mlmPositionConfiremed.html');
        let emailHtml = fs.readFileSync(htmlFilePath, 'utf8');
        emailHtml = emailHtml.replace('{{referralLink}}',referralLink).replace("{{name}}",name)
        sendMail(emailHtml,email,"MLM position confirmed");
        return {
            status:"success",
            message:"Welcome email sent successfully"
        }
       }catch(err){
         return err
    }
}

export const adminConfirmationMailtoUser=(email,name,transactionId,paymentDate)=>{
      try{
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename); 
        const htmlFilePath = path.join(__dirname, 'awatinApproval.html');
        let emailHtml = fs.readFileSync(htmlFilePath, 'utf8');
        emailHtml = emailHtml.replace('{{name}}',name)
       .replace('{{transactionId}}',transactionId).replace('{{paymentDate}}',paymentDate)
       sendMail(emailHtml,email,"MLM Awating Approval")
      }catch(err){
         return err
      }
}
function sendMail(emailHtml,email,subject){
    const transporter = nodemailer.createTransport({
        host: 'smtp.hostinger.com',
        port: 587, // Use port 465 for SSL
        secure: false,
        auth: {
            user: 'info@ourmicrolife.com',
            pass: 'Info#OurMicro@Life599'
        }
    });
    var mailOptions = {
        from: 'info@ourmicrolife.com',
        to: email,
        subject: subject || "404 Not Found",
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