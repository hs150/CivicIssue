import "dotenv/config";
import bcrypt from "bcryptjs";
import { query, pool } from "./db/index.js";

const users = [
    {
        name: "Demo Citizen",
        email: "citizen@civicconnect.demo",
        password: "Demo@123",
        role: "citizen"
    },
    {
        name: "Demo Officer",
        email: "officer@civicconnect.demo",
        password: "Demo@123",
        role: "officer"
    },
    {
        name: "Demo Admin",
        email: "admin@civicconnect.demo",
        password: "Demo@123",
        role: "admin"
    }
];

for (const user of users) {

    const passwordHash =
        await bcrypt.hash(user.password, 12);

    await query(
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
            $2,
            $3,
            $4
        )
        ON CONFLICT (email)
        DO UPDATE SET
            name = EXCLUDED.name,
            password_hash = EXCLUDED.password_hash,
            role = EXCLUDED.role,
            updated_at = NOW()
        `,
        [
            user.name,
            user.email,
            passwordHash,
            user.role
        ]
    );

    console.log(`Seeded: ${user.email}`);
}

await pool.end();
