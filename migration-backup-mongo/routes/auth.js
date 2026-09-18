import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { demo, publicUser } from "../utils/demoStore.js";

const router = Router();

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET || "demo-secret-change-me", { expiresIn: "7d" });
}

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({ message: "Name, email and a password of at least 6 characters are required." });
    }

    if (process.env.MONGO_URI) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) return res.status(409).json({ message: "Email is already registered." });

      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email: email.toLowerCase(), password: hashed, role: "citizen" });
      return res.status(201).json({ token: signToken(user._id.toString()), user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
    }

    const existing = demo.users.find(u => u.email === email.toLowerCase());
    if (existing) return res.status(409).json({ message: "Email is already registered." });

    const user = {
      _id: `demo-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      password: await bcrypt.hash(password, 10),
      role: "citizen"
    };
    demo.users.push(user);
    return res.status(201).json({ token: signToken(user._id), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    let user;
    if (process.env.MONGO_URI) {
      user = await User.findOne({ email: email?.toLowerCase() });
    } else {
      user = demo.users.find(u => u.email === email?.toLowerCase());
    }

    if (!user || !(await bcrypt.compare(password || "", user.password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const safeUser = process.env.MONGO_URI
      ? { _id: user._id, name: user.name, email: user.email, role: user.role }
      : publicUser(user);

    res.json({ token: signToken(user._id.toString()), user: safeUser });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: { _id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role } });
});

export default router;
