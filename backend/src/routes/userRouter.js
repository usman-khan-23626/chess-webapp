import express from "express"
import { checkuser, postuser } from "../controllers/usercontroller.js";
import { checkvalidschema } from "../utils/validation.js";


const userrouter = express.Router();

userrouter.post("/signup", checkvalidschema, async (req, res) => {
   try {
      const user = req.body;
      const response = await postuser(user);
      res.status(201).json({
         success: true,
         data: response,
      });
   } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Internal server error during signup" });
   }
});

userrouter.post("/login", async (req, res) => {
   try {
      const user = req.body;
      const response = await checkuser(user);
      console.log("response is :", response);
      if (response.error) {
         return res.status(401).json({ error: response.error })
      }

      if (!response.token) {
         return res.status(500).json({
            error: "Token not generated"
         });
      }
      res.cookie("token", response.token, {
         httpOnly: true,
      });
      res.send({
         success: true,
         ...response
      });
   }
   catch (error) {
      console.error("login error", error);
      res.status(500).json({ error: "Internal server error during login" });
   }


})

userrouter.post("/logout", async (req, res) => {
   res.clearCookie("token")
   res.json({
      success: true,
      message: "Logged out successfully"
   })

})

export default userrouter;