import express from "express";
import "dotenv/config";
import http from "http";
import { initializeSocket } from "./socket/socket.js";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import userrouter from "./routes/userRouter.js";
import gameRouter from "./routes/gameRouter.js";
import authrouter from "./routes/authRouter.js";
import dashboard from "./routes/dashboardrouter.js";

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

console.log("Environment variables check:");
console.log("- JWT_SECRET:", process.env.JWT_SECRET ? "LOADED" : "MISSING");
console.log("- DB_URL:", process.env.DB_URL ? "LOADED" : "MISSING");


app.get("/", (req, res) => {
    res.send("welcome to the chess app")
});

app.use("/user", userrouter);
app.use("/game", gameRouter);
app.use("/auth", authrouter);
app.use("/dashboard", dashboard);

server.listen(7000, async () => {
    console.log("server is running on the port # 7000")
    try {
        await mongoose.connect(process.env.DB_URL)
        console.log("succesfully connected to the database")
    } catch (error) {
        console.error("not connected error :", error)
    }
});