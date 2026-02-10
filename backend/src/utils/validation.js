import { User } from "../models/user.mongo.js";

export async function checkvalidschema(req, res, next) {
  try {
    const { email, password, name } = req.body || {};

    if (!name) return res.status(400).json({ error: "Name is missing" });
    if (!email) return res.status(400).json({ error: "Email is missing" });
    if (!password) return res.status(400).json({ error: "Password is missing" });

    const emailregex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailregex.test(email)) {
      return res.status(400).json({ error: "Email syntax is not valid" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const existingemail = await User.findOne({ email });
    if (existingemail) {
      return res.status(400).json({ error: "User already exists" });
    }

    next();
  } catch (error) {
    console.error("Validation middleware error:", error);
    res.status(500).json({ error: "Internal server error during validation" });
  }
}