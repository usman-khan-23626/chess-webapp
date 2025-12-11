import nodemailer from "nodemailer"
import "dotenv/config";

export const sendresetemail= async (email,resetlink)=>{
const transporter = nodemailer.createTransport({
    service:"gmail",auth:{
        user:process.env.EMAIL_USER,
        password:process.env.EMAIL_PASS,
    }
});

const mailoption ={
    from:process.env.EMAIL_USER,
    to:email,
    subject:"PASSWORD RESET LINK",
    text:`reset your password ${resetlink}\n link expire in 10 mint`
};
   await transporter.sendMail(mailoption)
} 