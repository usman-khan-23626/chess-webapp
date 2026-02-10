import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "./user.mongo.js"

export async function creatuser(user) {
    try {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(user.password, salt);
        const newuser = new User({
            name: user.name,
            email: user.email,
            password: hash,
        })
        const saveduser = await newuser.save();
        return saveduser;
    } catch (error) {
        console.error("user not saved", error)
        throw error;
    }
}

export async function varifyuser(user) {
    try {
        const email = user.email;
        const password = user.password;
        console.log("Attempting to verify user:", email);

        const userexist = await User.findOne({ email: email });
        if (!userexist) {
            console.log("User not found:", email);
            return { error: "user not exist" }
        }

        const checkpassword = bcrypt.compareSync(password, userexist.password)
        if (checkpassword) {
            console.log("Password correct for user:", email);
            if (!process.env.JWT_SECRET) {
                console.error("JWT_SECRET is missing from environment variables!");
                throw new Error("JWT_SECRET missing");
            }

            const token = jwt.sign({
                id: userexist._id,
            }, process.env.JWT_SECRET, { expiresIn: '24h' }
            )
            console.log("Token generated successfully");
            return {
                message: "your logged in",
                token: token,
                user: {
                    _id: userexist._id,
                    name: userexist.name,
                    email: userexist.email
                }
            }

        } else {
            console.log("Incorrect password for user:", email);
            return { error: "your password is incorrect" }
        }
    } catch (error) {
        console.error("Error in varifyuser:", error);
        throw error;
    }
}