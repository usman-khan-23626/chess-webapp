import express from "express";
import os from "os";

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
    origin: (origin, callback) => {
        // In local network development, allow any origin to facilitate access from other devices
        callback(null, true);
    },
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

const PORT = process.env.PORT || 7000;

server.listen(PORT, async () => {
    console.log(`server is running on the port # ${PORT}`)
    try {
        await mongoose.connect(process.env.DB_URL)
        console.log("succesfully connected to the database")

        // Log local IP address for other devices
        const networkInterfaces = os.networkInterfaces();
        console.log("\nAccess the app from other devices using:");
        for (const interfaceName in networkInterfaces) {
            for (const networkInterface of networkInterfaces[interfaceName]) {
                if (networkInterface.family === 'IPv4' && !networkInterface.internal) {
                    console.log(`- Frontend: http://${networkInterface.address}:5173`);
                    console.log(`- Backend:  http://${networkInterface.address}:${PORT}`);
                }
            }
        }
        console.log("");
    } catch (error) {

        console.error("not connected error :", error)
    }
});