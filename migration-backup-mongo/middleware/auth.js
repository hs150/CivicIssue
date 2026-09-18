import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { getDemoUser } from "../utils/demoStore.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) return res.status(401).json({ message: "Authentication required." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "demo-secret-change-me");

    if (process.env.MONGO_URI) {
      const user = await User.findById(decoded.id).select("-password");
      if (!user) return res.status(401).json({ message: "User not found." });
      req.user = user;
    } else {
      const user = getDemoUser(decoded.id);
      if (!user) return res.status(401).json({ message: "User not found." });
      req.user = user;
    }

    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission for this action." });
    }
    next();
  };
}
