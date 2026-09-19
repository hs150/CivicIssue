import { Router } from "express";
import multer from "multer";
import { randomUUID } from "crypto";

import { query, withTransaction } from "../db/index.js";
import { requireAuth } from "../middleware/auth.js";
import { analyzeIssueImage } from "../services/aiService.js";
import { uploadImage } from "../services/storage.js";
import { calculatePriority, categoryInfo } from "../constants.js";
import { distanceMeters } from "../services/issueService.js";
import { sendNotification } from "../services/notify.js";

const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowed = /^image\/(jpeg|png|webp|jpg)$/i.test(
            file.mimetype
        );

        cb(null, allowed);
    }
});


/* =========================================================
   HELPERS
========================================================= */

function normalizeIssue(row) {
    if (!row) return null;

    return {
        _id: row.id,
        id: row.id,

        issueCode: row.issue_code,

        title: row.title,
        description: row.description,

        category: row.category,
        department: row.department,

        imageUrl: row.image_url,

        location: {
            latitude: row.latitude,
            longitude: row.longitude,
            address: row.address
        },

        latitude: row.latitude,
        longitude: row.longitude,
        address: row.address,

        reportedBy: row.reported_by,
        assignedTo: row.assigned_to,

        status: row.status,
        phase: row.phase,

        priority: row.priority,
        priorityScore: row.priority_score,

        upvotes: row.upvotes,

        resolutionNote: row.resolution_note,
        resolutionImageUrl: row.resolution_image_url,
        fixVerification: row.fix_verification || {},
        resolvedAt: row.resolved_at,

        citizenConfirmations: Number(row.citizen_confirmations) || 0,
        citizenDisputes: Number(row.citizen_disputes) || 0,
        citizenVerified: Boolean(row.citizen_verified),
        citizenVerifications: Array.isArray(row.citizen_verifications) ? row.citizen_verifications : [],

        conditions: row.conditions || {},
        aiAnalysis: row.ai_analysis || {},

        createdAt: row.created_at,
        updatedAt: row.updated_at,

        reporter: row.reporter_name
            ? {
                id: row.reported_by,
                name: row.reporter_name,
                email: row.reporter_email
            }
            : undefined,

        assignedOfficer: row.officer_name
            ? {
                id: row.assigned_to,
                name: row.officer_name,
                email: row.officer_email
            }
            : undefined
    };
}


function issueSelect() {
    return `
        SELECT
            i.*,

            reporter.name AS reporter_name,
            reporter.email AS reporter_email,

            officer.name AS officer_name,
            officer.email AS officer_email

        FROM issues i

        LEFT JOIN users reporter
            ON reporter.id = i.reported_by

        LEFT JOIN users officer
            ON officer.id = i.assigned_to
    `;
}


function getIssueCode() {
    return `CC-${Date.now().toString().slice(-8)}`;
}


/* =========================================================
   GET ALL ISSUES
========================================================= */

router.get("/", async (req, res, next) => {
    try {
        const {
            status,
            category,
            mine,
            search,
            phase
        } = req.query;

        const conditions = [];
        const params = [];

        if (status) {
            params.push(status);
            conditions.push(`i.status = $${params.length}`);
        }

        if (phase) {
            params.push(phase);
            conditions.push(`i.phase = $${params.length}`);
        }

        if (category) {
            params.push(category);
            conditions.push(`LOWER(i.category) = LOWER($${params.length})`);
        }

        if (search) {
            params.push(`%${search}%`);

            conditions.push(`
                (
                    i.title ILIKE $${params.length}
                    OR
                    i.description ILIKE $${params.length}
                    OR
                    i.issue_code ILIKE $${params.length}
                )
            `);
        }

        if (mine) {
            if (!req.user) {
                return res.status(401).json({
                    message: "Authentication required."
                });
            }

            params.push(req.user.id);
            conditions.push(`i.reported_by = $${params.length}`);
        }

        const where = conditions.length
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

        const result = await query(
            `
            ${issueSelect()}

            ${where}

            ORDER BY i.created_at DESC

            LIMIT 100
            `,
            params
        );

        res.json({
            issues: result.rows.map(normalizeIssue)
        });

    } catch (error) {
        next(error);
    }
});


/* =========================================================
   GET MY ISSUES
========================================================= */

router.get("/mine", requireAuth, async (req, res, next) => {
    try {

        const result = await query(
            `
            ${issueSelect()}

            WHERE i.reported_by = $1

            ORDER BY i.created_at DESC
            `,
            [req.user.id]
        );

        res.json({
            issues: result.rows.map(normalizeIssue)
        });

    } catch (error) {
        next(error);
    }
});


/* =========================================================
   GEO-DEDUPLICATION: NEARBY ISSUES
========================================================= */

router.get("/nearby", async (req, res, next) => {
    try {
        const { lat, lng, radius = 500, category } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                message: "lat and lng are required."
            });
        }

        const latitude = Number(lat);
        const longitude = Number(lng);
        const radiusMeters = Number(radius);

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            return res.status(400).json({
                message: "Invalid coordinates."
            });
        }

        const params = [latitude, longitude, radiusMeters];
        let categoryFilter = "";

        if (category) {
            params.push(category);
            categoryFilter = `AND LOWER(i.category) = LOWER($${params.length})`;
        }

        const result = await query(
            `
            SELECT * FROM (
                SELECT
                    i.id,
                    i.issue_code,
                    i.title,
                    i.description,
                    i.category,
                    i.image_url,
                    i.latitude,
                    i.longitude,
                    i.address,
                    i.status,
                    i.phase,
                    i.priority,
                    i.upvotes,
                    i.created_at,

                    (
                        6371000 * acos(
                            LEAST(1.0, GREATEST(-1.0,
                                cos(radians($1)) * cos(radians(i.latitude))
                                * cos(radians(i.longitude) - radians($2))
                                + sin(radians($1)) * sin(radians(i.latitude))
                            ))
                        )
                    ) AS distance_meters

                FROM issues i

                WHERE i.phase NOT IN ('CLOSED', 'REJECTED')

                ${categoryFilter}
            ) sub

            WHERE sub.distance_meters <= $3

            ORDER BY sub.distance_meters ASC

            LIMIT 10
            `,
            params
        );

        res.json({
            nearby: result.rows.map(row => ({
                _id: row.id,
                id: row.id,
                issueCode: row.issue_code,
                title: row.title,
                description: row.description,
                category: row.category,
                imageUrl: row.image_url,
                latitude: row.latitude,
                longitude: row.longitude,
                address: row.address,
                status: row.status,
                phase: row.phase,
                priority: row.priority,
                upvotes: row.upvotes,
                createdAt: row.created_at,
                distanceMeters: Math.round(Number(row.distance_meters))
            }))
        });

    } catch (error) {
        next(error);
    }
});


/* =========================================================
   GET SINGLE ISSUE
========================================================= */

router.get("/:id", async (req, res, next) => {
    try {

        const issueId = req.params.id?.trim();

        // PostgreSQL issues.id is UUID.
        // Reject missing/invalid IDs before querying PostgreSQL.
        const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

        if (!issueId || !uuidRegex.test(issueId)) {
            return res.status(400).json({
                message: "Invalid issue ID.",
                issueId: issueId || null
            });
        }

        const result = await query(
            `
            ${issueSelect()}

            WHERE i.id = $1
            `,
            [issueId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Issue not found."
            });
        }

        const issue = normalizeIssue(result.rows[0]);

        const commentsResult = await query(
            `
            SELECT
                c.id,
                c.issue_id,
                c.text,
                c.created_at,

                u.id AS user_id,
                u.name AS user_name,
                u.role AS user_role

            FROM comments c

            LEFT JOIN users u
                ON u.id = c.user_id

            WHERE c.issue_id = $1

            ORDER BY c.created_at ASC
            `,
            [issueId]
        );

        const historyResult = await query(
            `
            SELECT
                h.id,
                h.issue_id,
                h.status,
                h.phase,
                h.changed_by,
                h.remarks,
                h.conditions,
                h.created_at,

                u.name AS changed_by_name,
                u.role AS changed_by_role

            FROM status_history h

            LEFT JOIN users u
                ON u.id = h.changed_by

            WHERE h.issue_id = $1

            ORDER BY h.created_at ASC
            `,
            [issueId]
        );

        res.json({
            issue,

            comments: commentsResult.rows.map(c => ({
                id: c.id,
                issueId: c.issue_id,
                text: c.text,
                createdAt: c.created_at,

                userId: {
                    id: c.user_id,
                    name: c.user_name,
                    role: c.user_role
                }
            })),

            history: historyResult.rows.map(h => ({
                id: h.id,
                issueId: h.issue_id,
                status: h.status,
                phase: h.phase,
                changedBy: {
                    id: h.changed_by,
                    name: h.changed_by_name,
                    role: h.changed_by_role
                },
                remarks: h.remarks,
                conditions: h.conditions || {},
                createdAt: h.created_at
            }))
        });

    } catch (error) {
        next(error);
    }
});


/* =========================================================
   AI IMAGE ANALYSIS
========================================================= */

router.post(
    "/analyze-image",
    requireAuth,
    upload.single("image"),
    async (req, res, next) => {

        try {

            if (!req.file) {
                return res.status(400).json({
                    message: "Image is required."
                });
            }

            const imageBase64 =
                req.file.buffer.toString("base64");

            const result = await analyzeIssueImage({
                imageBuffer: Buffer.from(imageBase64, "base64"),
                mimeType: req.file.mimetype
            });

            console.log(
                "AI Image Analysis:",
                result
            );

            res.json({
                success: true,
                analysis: result
            });

        } catch (error) {

            console.error(
                "Image AI analysis failed:",
                error
            );

            res.status(500).json({
                message: "Unable to analyze image."
            });
        }
    }
);


/* =========================================================
   CREATE ISSUE
========================================================= */

router.post(
    "/",
    requireAuth,
    upload.single("image"),
    async (req, res, next) => {

        try {

            const {
                title,
                description,
                category,
                department,
                latitude,
                longitude,
                address,
                severity,
                priority
            } = req.body;

            if (
                !title ||
                !description ||
                !category ||
                latitude === undefined ||
                longitude === undefined
            ) {
                return res.status(400).json({
                    message:
                        "Title, description, category and location are required."
                });
            }

            let imageUrl = null;

            if (req.file) {
                imageUrl = await uploadImage(req.file);
            }

            const calculated =
                calculatePriority
                    ? calculatePriority({
                        category,
                        severity
                    })
                    : {
                        priority: priority || "MEDIUM",
                        score: 50
                    };

            const issueId = randomUUID();

            const issueCode = getIssueCode();

            const conditions = {
                submitted: true,
                aiAnalyzed: false
            };

            const aiAnalysis = {};

            const inserted = await withTransaction(
                async client => {

                    const issueResult =
                        await client.query(
                            `
                            INSERT INTO issues (
                                id,
                                issue_code,
                                title,
                                description,
                                category,
                                department,
                                image_url,
                                latitude,
                                longitude,
                                address,
                                reported_by,
                                status,
                                phase,
                                priority,
                                priority_score,
                                upvotes,
                                conditions,
                                ai_analysis
                            )

                            VALUES (
                                $1,
                                $2,
                                $3,
                                $4,
                                $5,
                                $6,
                                $7,
                                $8,
                                $9,
                                $10,
                                $11,
                                'NEW',
                                'NEW',
                                $12,
                                $13,
                                0,
                                $14,
                                $15
                            )

                            RETURNING *
                            `,
                            [
                                issueId,
                                issueCode,
                                title,
                                description,
                                category,
                                department || null,
                                imageUrl,
                                Number(latitude),
                                Number(longitude),
                                address || null,
                                req.user.id,
                                calculated.priority || priority || "MEDIUM",
                                calculated.score || 50,
                                JSON.stringify(conditions),
                                JSON.stringify(aiAnalysis)
                            ]
                        );

                    await client.query(
                        `
                        INSERT INTO status_history (
                            issue_id,
                            status,
                            phase,
                            changed_by,
                            remarks,
                            conditions
                        )

                        VALUES (
                            $1,
                            'NEW',
                            'NEW',
                            $2,
                            $3,
                            $4
                        )
                        `,
                        [
                            issueId,
                            req.user.id,
                            "Issue reported",
                            JSON.stringify(conditions)
                        ]
                    );

                    return issueResult.rows[0];
                }
            );

            const response = normalizeIssue(inserted);

            try {
                await sendNotification(
                    "issue-created",
                    response
                );
            } catch (notificationError) {
                console.error(
                    "Notification failed:",
                    notificationError.message
                );
            }

            res.status(201).json({
                success: true,
                issue: response
            });

        } catch (error) {
            next(error);
        }
    }
);


/* =========================================================
   UPVOTE
========================================================= */

router.post(
    "/:id/upvote",
    requireAuth,
    async (req, res, next) => {

        try {

            const result =
                await withTransaction(async client => {

                    const existing =
                        await client.query(
                            `
                            SELECT 1

                            FROM issue_upvotes

                            WHERE issue_id = $1
                            AND user_id = $2
                            `,
                            [
                                req.params.id,
                                req.user.id
                            ]
                        );

                    if (existing.rowCount > 0) {

                        return {
                            alreadyVoted: true
                        };
                    }

                    await client.query(
                        `
                        INSERT INTO issue_upvotes (
                            issue_id,
                            user_id
                        )

                        VALUES ($1, $2)
                        `,
                        [
                            req.params.id,
                            req.user.id
                        ]
                    );

                    const updated =
                        await client.query(
                            `
                            UPDATE issues

                            SET
                                upvotes = upvotes + 1,
                                updated_at = NOW()

                            WHERE id = $1

                            RETURNING upvotes
                            `,
                            [req.params.id]
                        );

                    return {
                        alreadyVoted: false,
                        upvotes:
                            updated.rows[0]?.upvotes || 0
                    };
                });

            res.json(result);

        } catch (error) {
            next(error);
        }
    }
);


/* =========================================================
   CITIZEN COMMUNITY SIGN-OFF & DISPUTE
========================================================= */

router.post(
    "/:id/citizen-verify",
    requireAuth,
    async (req, res, next) => {
        try {
            const { action, note = "" } = req.body; // action: "confirm" | "dispute"

            if (!["confirm", "dispute"].includes(action)) {
                return res.status(400).json({
                    message: "Action must be 'confirm' or 'dispute'."
                });
            }

            const issueId = req.params.id;

            const issueRes = await query(
                "SELECT id, phase, citizen_verifications, citizen_confirmations, citizen_disputes FROM issues WHERE id = $1",
                [issueId]
            );

            if (issueRes.rowCount === 0) {
                return res.status(404).json({ message: "Issue not found." });
            }

            const issue = issueRes.rows[0];
            const verifications = Array.isArray(issue.citizen_verifications) ? issue.citizen_verifications : [];

            // Check if user already submitted
            const existingIdx = verifications.findIndex(v => v.userId === req.user.id);
            if (existingIdx >= 0) {
                return res.status(400).json({
                    message: "You have already submitted a community review for this issue."
                });
            }

            const newVote = {
                userId: req.user.id,
                userName: req.user.name || req.user.email,
                userRole: req.user.role || "citizen",
                action,
                note: note.trim(),
                createdAt: new Date().toISOString()
            };

            verifications.push(newVote);

            const newConfirmations = (issue.citizen_confirmations || 0) + (action === "confirm" ? 1 : 0);
            const newDisputes = (issue.citizen_disputes || 0) + (action === "dispute" ? 1 : 0);
            const isVerified = newConfirmations >= 2 && newConfirmations > newDisputes;

            const updateRes = await query(
                `
                UPDATE issues
                SET
                    citizen_confirmations = $1,
                    citizen_disputes = $2,
                    citizen_verified = $3,
                    citizen_verifications = $4::jsonb,
                    updated_at = NOW()
                WHERE id = $5
                RETURNING citizen_confirmations, citizen_disputes, citizen_verified, citizen_verifications
                `,
                [
                    newConfirmations,
                    newDisputes,
                    isVerified,
                    JSON.stringify(verifications),
                    issueId
                ]
            );

            res.json({
                success: true,
                message: action === "confirm"
                    ? "Thank you! You have confirmed this fix. 👍"
                    : "Your dispute has been logged for supervisor re-inspection. ⚠️",
                data: {
                    citizenConfirmations: updateRes.rows[0].citizen_confirmations,
                    citizenDisputes: updateRes.rows[0].citizen_disputes,
                    citizenVerified: updateRes.rows[0].citizen_verified,
                    citizenVerifications: updateRes.rows[0].citizen_verifications
                }
            });

        } catch (error) {
            next(error);
        }
    }
);


/* =========================================================
   ADD COMMENT
========================================================= */

router.post(
    "/:id/comments",
    requireAuth,
    async (req, res, next) => {

        try {

            const { text } = req.body;

            if (!text?.trim()) {
                return res.status(400).json({
                    message: "Comment text is required."
                });
            }

            const result = await query(
                `
                INSERT INTO comments (
                    issue_id,
                    user_id,
                    text
                )

                VALUES ($1, $2, $3)

                RETURNING *
                `,
                [
                    req.params.id,
                    req.user.id,
                    text.trim()
                ]
            );

            res.status(201).json({
                comment: {
                    ...result.rows[0],

                    userId: {
                        id: req.user.id,
                        name: req.user.name,
                        role: req.user.role
                    }
                }
            });

        } catch (error) {
            next(error);
        }
    }
);


/* =========================================================
   DELETE ISSUE
========================================================= */

router.delete(
    "/:id",
    requireAuth,
    async (req, res, next) => {

        try {

            const result = await query(
                `
                DELETE FROM issues

                WHERE id = $1
                AND reported_by = $2

                RETURNING id
                `,
                [
                    req.params.id,
                    req.user.id
                ]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({
                    message:
                        "Issue not found or you are not allowed to delete it."
                });
            }

            res.json({
                success: true
            });

        } catch (error) {
            next(error);
        }
    }
);


export default router;




