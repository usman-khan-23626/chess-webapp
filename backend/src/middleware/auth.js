import jwt from "jsonwebtoken";
import {User} from "../models/user.mongo.js"



export const varifytoken = async (req,res,next)=>{
  try{
    const token = req.cookies.token;
   if(!token){
    res.status(400).json({
        error:"please login first"
    });
   };
const decode = jwt.verify(token,process.env.JWT_SECRET)
const user = await User.findById(decode.id).select("-password")
if (!user){
    res.status(400).json({
        error:"user not found"
    })
}
req.user = user;
next()
  }catch(error){
    console.error("auth error:",error)
    res.status(400).json({
        error:"invalid or expired token"
    })
  }

}

