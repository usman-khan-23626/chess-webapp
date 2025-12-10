import express from "express"
import { checkuser, postuser } from "../controllers/usercontroller.js";
import { checkvalidschema } from "../utils/validation.js";


const userrouter = express.Router();

userrouter.post("/signup",checkvalidschema, async (req,res)=>{
   const user = req.body;
   const response = await postuser(user);
   res.send({data:response,
    
      })

});
userrouter.post("/login", async (req,res)=>{
    try {
    const user = req.body;
    const response = await checkuser(user);
    console.log("response is :",response);
    if (response.error){
     return res.status(401).json({error :response.error})
    }
      
   if (!response.token){
        return res.status(500).json({
                error: "Token not generated"
            });
   }
      res.cookie("token",response.token,{
         httpOnly:true,
      });
      res.send({
         data:response.message,
      });}
      catch(error){
         console.error("login error",error);

      }

    
})


export default userrouter;