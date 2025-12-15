import mongoose from "mongoose";

const userschema = new mongoose.Schema({
  name : {type: String ,required:true},
  email :{type: String ,required:true , unique : true},
  password: {type: String ,required:true},
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  chessRating: { type: Number, default: 1000 },
gamesPlayed: { type: Number, default: 0 },
gamesWon: { type: Number, default: 0 },
gamesLost: { type: Number, default: 0 },
gamesDrawn: { type: Number, default: 0 },
    
}, { timestamps: true
});

export const User = mongoose.model("User",userschema)