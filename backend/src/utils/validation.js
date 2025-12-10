import { User } from "../models/user.mongo.js";

export async function checkvalidschema(req,res,next){
    const requestbody = req.body;
    const email = requestbody.email;
    const password= requestbody.password;
    const name= requestbody.name;
    
    const emailregex =/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const ok = emailregex.exec(email);
    const validpassword = password.length >= 8;
      if (!name){
        return res.status(400).json({message:"name is missing"})
  
      } 
      if (!email){
        return res.status(400).json({message:"email is missing"})
      }
       if (!password){
        return res.status(400).json({message:"password is missing"})}

        if (!ok ){
        return res.status(400).json({message:"Email syntax is not valid "})
    }
     if(!validpassword){
        return res.status(400).json({message:"password must be more than 8 digit"})
    }
    const existingemail = await User.findOne({email})
       if(existingemail){
       return res.status(400).json({message:"user already exist"})
      }
    

    
  
     
      next();
}