import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import issueRoutes from "./routes/issues.js";
import officerRoutes from "./routes/officer.js";
import { errorHandler } from "./middleware/error.js";

const app = express();

const __dirname =
    path.dirname(fileURLToPath(import.meta.url));

app.use(cors({
    origin: process.env.CLIENT_URL
        ? process.env.CLIENT_URL.split(",")
        : true,
    credentials: true
}));

app.use(express.json({
    limit: "2mb"
}));

app.use(express.urlencoded({
    extended: true,
    limit: "5mb"
}));

app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);


app.get("/api/health", async (req, res) => {

    try {

        const { query } =
            await import("./db/index.js");

        const result =
            await query(
                "SELECT current_database() AS database"
            );

        res.json({
            ok: true,
            service: "CivicConnect API",
            mode: "postgresql",
            database: result.rows[0].database
        });

    } catch (error) {

        res.status(503).json({
            ok: false,
            service: "CivicConnect API",
            mode: "postgresql",
            database: "unavailable"
        });
    }
});


app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/issues",
    issueRoutes
);

app.use(
    "/api/officer",
    officerRoutes
);

app.use(errorHandler);

export default app;
