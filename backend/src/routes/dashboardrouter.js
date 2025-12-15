import express from "express";
import  {varifytoken} from "../middleware/auth.js"
const dashboard = express.Router();

dashboard.get("/lobby",varifytoken,(req,res)=>{
  res.json({
    user:{
        name:req.user.name,
        email:req.user.email,
        rating:req.user.rating || 1000

    },  menu: [
            { id: "play", title: " Play Game", path: "/game/create" },
            { id: "join", title: "Join Game", path: "/game/available" },
            { id: "puzzle", title: "Puzzles", path: "/puzzles" },
            { id: "leaderboard", title: "Leaderboard", path: "/leaderboard" },
            { id: "profile", title: "Profile", path: "/profile" },
            { id: "friends", title: "Friends", path: "/friends" }
        ],
        stats: {
            gamesPlayed: req.user.gamesPlayed || 0,
            gamesWon: req.user.gamesWon || 0,
            winRate: req.user.gamesPlayed ? 
                Math.round((req.user.gamesWon / req.user.gamesPlayed) * 100) : 0
        }
  });
});

export default dashboard ; 