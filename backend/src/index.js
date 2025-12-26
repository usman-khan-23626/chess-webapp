import express from "express";
import "dotenv/config";
import http from "http";
import { initializeSocket } from "./socket.js";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import userrouter from "./routes/userRouter.js";
import gameRouter from "./routes/gameRouter.js";
import authrouter from "./routes/authRouter.js";
import dashboard from "./routes/dashboardrouter.js";
const app = express();

app.use(express.json());
app.use(cookieParser());
app.get("/",(req,res)=>{
    res.send("welcome to the chess app")
});
app.use("/user",userrouter)
app.use("/game",gameRouter)
app.use("/auth",authrouter)
app.use("/dashboard",dashboard)

const server = http.createServer(app)
initializeSocket(server);

server.listen(7000, async ()=>{
    console.log("server is running with socket on the port # 7000")
    try {
     await mongoose.connect(process.env.DB_URL)
     console.log("succesfully connected to the database")
    }catch(error){
        console.error("not connected error :",error)
    }
});