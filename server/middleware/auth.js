import jwt from "jsonwebtoken";
import { query } from "../db/index.js";

export async function requireAuth(req, res, next) {
    try {
        const header = req.headers.authorization;

        if (!header || !header.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Authentication required."
            });
        }

        const token = header.substring(7);

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const result = await query(
            `
            SELECT
                id,
                name,
                email,
                role,
                created_at
            FROM users
            WHERE id = $1
            `,
            [decoded.id]
        );

        if (result.rowCount === 0) {
            return res.status(401).json({
                message: "User no longer exists."
            });
        }

        req.user = result.rows[0];

        next();

    } catch (error) {

        console.error("Authentication error:", error.message);

        return res.status(401).json({
            message: "Invalid or expired authentication token."
        });
    }
}

export function requireRole(...roles) {
    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required."
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Insufficient permissions."
            });
        }

        next();
    };
}
