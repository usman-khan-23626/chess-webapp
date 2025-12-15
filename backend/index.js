import express from "express";
import "dotenv/config";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dashboard from "./src/routes/dashboardrouter.js";
import userrouter from "./src/routes/userRouter.js"
import authrouter from "./src/routes/authRouter.js";
const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/",(req,res)=>{
    res.send("welcome to the chess app")
});
app.use("/dashboard",dashboard)
app.use("/user",userrouter)
app.use("/auth",authrouter)

app.listen(7000, async ()=>{
    console.log("running on the port # 7000")
    try {
     await mongoose.connect(process.env.DB_URL)
     console.log("succesfully connected to the database")
    }catch(error){
        console.error("not connected error :",error)
    }
});