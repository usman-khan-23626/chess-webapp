import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {User} from "./user.mongo.js" 

export async function creatuser(user){
    try{
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(user.password,salt)
        const newuser = new User ({
            name : user.name,
            email : user.email,
            password :hash,
        })
        const saveduser= await newuser.save();
        return saveduser;
    }catch(error){
        console.error("user not saved",error)
        throw error;
    }
}

export async function varifyuser(user){
    const email = user.email;
    const password = user.password;
    const userexist = await User.findOne({email:email,})
    if (!userexist){
        return {error : "user not exist"}
    }

    const checkpassword = bcrypt.compareSync(password,userexist.password)
    if (checkpassword){
     const token= jwt.sign({
        id : userexist._id,
        },process.env.JWT_SECRET,{expiresIn:'24h'}
    )
     return {
        message :"your logged in",
        token : token
     }
    }else{
       return {error : "your password is incorrect"}
    }

  
}