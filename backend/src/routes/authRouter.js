import express from "express"
import crypto from "crypto"
import bcrypt from "bcrypt"
import { User } from "../models/user.mongo.js"
import  {sendresetemail} from "../services/email.services.js"

const authrouter = express.Router()


authrouter.post("/forget-password" ,async (req,res)=>{
    try{
        const {email} = req.body;
        const user = await User.findOne({email})

        if(!user){
            return res.json({
                message : "if email exist then reset link will be send"
            });
        }
      const resettoken = crypto.randomBytes(32).toString("hex");
       const hashedToken = crypto.createHash("sha256").update(resettoken).digest("hex");
       user.resetPasswordToken = hashedToken
       user.resetPasswordExpires = Date.now() + 10 * 60* 1000;
       await user.save()
       const resetlink =`${process.env.FROENT_LINK}/reset-password/${resettoken}`;
        const sendemail = await sendresetemail(email,resetlink);
        if (sendemail){
            res.json({
                success: true,
                message:"reset link is sent succesfully"
            })
        }else{
            res.status(400).json({message:"reset link not sent"})

        }
    }catch(error){
    console.error("forget password error",error)
    res.status(500).json({error:"server error"})
    }


    
});

authrouter.post("/resetpassword/:token",async (req,res)=>{
    try{
        const {token}=req.params;
        const {password}= req.body;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
     const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() } });
            if(!user){
                return res.status(400).json({
                    message:"invalid link or expired link"
                }) }
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        
        res.json({
            success : true,
            message:"password reset succesfully"
        })




    }catch(error){
     console.error("reset password error:",error)
     res.status(500).json({error:"server error"})
    }
});

 export default authrouter;


 