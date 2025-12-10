import express from "express";
import "dotenv/config";
import mongoose from "mongoose";
import userrouter from "./routes/userRouter.js"
const app = express();

app.use(express.json());

app.get("/",(req,res)=>{
    res.send("welcome to the chess app")
});
app.use("/user",userrouter)


app.listen(7000, async ()=>{
    console.log("running on the port # 7000")
    try {
     await mongoose.connect(process.env.DB_URL)
     console.log("succesfully connected to the database")
    }catch(error){
        console.error("not connected error :",error)
    }
});