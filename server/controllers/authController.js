import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../db/index.js";

function signToken(user) {
    return jwt.sign(
        {
            id: user.id,
            role: user.role,
            email: user.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
}

export async function register(req, res, next) {

    try {

        const {
            name,
            email,
            password,
            role = "citizen"
        } = req.body;

        if (!name || !email || !password) {

            return res.status(400).json({
                message:
                    "Name, email and password are required."
            });

        }

        // Public registration is citizen-only.
        // Officer/admin accounts are provisioned separately.
        const finalRole = "citizen";

        const existing = await query(
            `
            SELECT id
            FROM users
            WHERE LOWER(email) = LOWER($1)
            `,
            [email.trim()]
        );

        if (existing.rowCount > 0) {

            return res.status(409).json({
                message:
                    "An account with this email already exists."
            });

        }

        const passwordHash =
            await bcrypt.hash(password, 12);

        const result = await query(
            `
            INSERT INTO users
            (
                name,
                email,
                password_hash,
                role
            )
            VALUES
            (
                $1,
                LOWER($2),
                $3,
                $4
            )
            RETURNING
                id,
                name,
                email,
                role,
                created_at
            `,
            [
                name.trim(),
                email.trim(),
                passwordHash,
                finalRole
            ]
        );

        const user = result.rows[0];

        const token = signToken(user);

        res.status(201).json({
            message:
                "Account created successfully.",
            token,
            user
        });

    } catch (error) {
        next(error);
    }
}

export async function login(req, res, next) {

    try {

        const {
            email,
            password
        } = req.body;

        if (!email || !password) {

            return res.status(400).json({
                message:
                    "Email and password are required."
            });

        }

        const result = await query(
            `
            SELECT
                id,
                name,
                email,
                password_hash,
                role
            FROM users
            WHERE LOWER(email) = LOWER($1)
            `,
            [email.trim()]
        );

        if (result.rowCount === 0) {

            return res.status(401).json({
                message:
                    "Invalid email or password."
            });

        }

        const user = result.rows[0];

        const valid =
            await bcrypt.compare(
                password,
                user.password_hash
            );

        if (!valid) {

            return res.status(401).json({
                message:
                    "Invalid email or password."
            });

        }

        delete user.password_hash;

        const token = signToken(user);

        res.json({
            message:
                "Login successful.",
            token,
            user
        });

    } catch (error) {
        next(error);
    }
}

export async function getCurrentUser(
    req,
    res,
    next
) {

    try {

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
            [req.user.id]
        );

        if (result.rowCount === 0) {

            return res.status(404).json({
                message:
                    "User not found."
            });

        }

        res.json({
            user: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
}
