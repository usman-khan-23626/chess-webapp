import mongoose from "mongoose";

const userschema = new mongoose.Schema({
  name : {type: String ,required:true},
  email :{type: String ,required:true , unique : true},
  password: {type: String ,required:true},
  resetPasswordToken: String,
  resetPasswordExpires: Date,
    
}, { timestamps: true
});

export const User = mongoose.model("User",userschema)