import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { query, withTransaction } from "../db/index.js";
import {
    evaluatePhase,
    buildConditions,
    PHASES
} from "../services/phaseEngine.js";
import { sendNotification } from "../services/notify.js";

const router = Router();

router.use(
    requireAuth,
    requireRole("officer", "admin")
);

/*
=========================================================
GET OFFICER STATISTICS
=========================================================
*/

router.get("/stats", async (req, res, next) => {

    try {

        const result = await query(`
            SELECT
                COUNT(*)::int AS total,

                COUNT(*) FILTER (
                    WHERE phase = 'NEW'
                )::int AS new,

                COUNT(*) FILTER (
                    WHERE phase = 'IN_PROGRESS'
                )::int AS "inProgress",

                COUNT(*) FILTER (
                    WHERE phase = 'RESOLUTION_REVIEW'
                )::int AS "resolutionReview",

                COUNT(*) FILTER (
                    WHERE phase = 'RESOLVED'
                )::int AS resolved,

                COUNT(*) FILTER (
                    WHERE phase = 'CLOSED'
                )::int AS closed,

                COUNT(*) FILTER (
                    WHERE phase = 'REJECTED'
                )::int AS rejected

            FROM issues
        `);

        res.json({
            stats: result.rows[0]
        });

    } catch (error) {

        next(error);

    }

});

/*
=========================================================
GET ALL ISSUES FOR OFFICER DASHBOARD
=========================================================
*/

router.get("/issues", async (req, res, next) => {

    try {

        const result = await query(`
            SELECT
                i.*,

                json_build_object(
                    'id', reporter.id,
                    'name', reporter.name,
                    'email', reporter.email
                ) AS "reportedBy",

                CASE
                    WHEN officer.id IS NOT NULL
                    THEN json_build_object(
                        'id', officer.id,
                        'name', officer.name,
                        'email', officer.email
                    )
                    ELSE NULL
                END AS "assignedTo"

            FROM issues i

            JOIN users reporter
                ON reporter.id = i.reported_by

            LEFT JOIN users officer
                ON officer.id = i.assigned_to

            ORDER BY
                i.priority_score DESC,
                i.created_at DESC

            LIMIT 200
        `);

        res.json({
            issues: result.rows
        });

    } catch (error) {

        next(error);

    }

});

/*
=========================================================
UPDATE ISSUE / PHASE TRANSITION
=========================================================

Body:

{
    "phase": "IN_PROGRESS",
    "assignedTo": "uuid",
    "resolutionNote": "..."
}

The server NEVER trusts the frontend phase.
=========================================================
*/

router.patch(
    "/issues/:id",
    async (req, res, next) => {

        try {

            const {
                phase,
                assignedTo,
                resolutionNote
            } = req.body;

            if (!phase) {

                return res.status(400).json({
                    message:
                        "phase is required."
                });

            }

            const result =
                await withTransaction(
                    async (client) => {

                        /*
                        -----------------------------------------
                        Lock issue row
                        -----------------------------------------
                        */

                        const issueResult =
                            await client.query(
                                `
                                SELECT *
                                FROM issues
                                WHERE id = $1
                                FOR UPDATE
                                `,
                                [req.params.id]
                            );

                        if (
                            issueResult.rowCount === 0
                        ) {

                            const error =
                                new Error(
                                    "Issue not found."
                                );

                            error.status = 404;

                            throw error;

                        }

                        const issue =
                            issueResult.rows[0];

                        /*
                        -----------------------------------------
                        Assignment
                        -----------------------------------------
                        */

                        let finalAssignedTo =
                            issue.assigned_to;

                        if (assignedTo) {

                            const officerResult =
                                await client.query(
                                    `
                                    SELECT id, name, email, role
                                    FROM users
                                    WHERE id = $1
                                    `,
                                    [assignedTo]
                                );

                            if (
                                officerResult.rowCount === 0
                            ) {

                                const error =
                                    new Error(
                                        "Assigned officer not found."
                                    );

                                error.status = 404;

                                throw error;

                            }

                            if (
                                ![
                                    "officer",
                                    "admin"
                                ].includes(
                                    officerResult.rows[0].role
                                )
                            ) {

                                const error =
                                    new Error(
                                        "User is not an officer or admin."
                                    );

                                error.status = 400;

                                throw error;

                            }

                            finalAssignedTo =
                                assignedTo;

                        }

                        /*
                        -----------------------------------------
                        Resolution note
                        -----------------------------------------
                        */

                        const finalResolutionNote =
                            resolutionNote !== undefined
                                ? resolutionNote
                                : issue.resolution_note;

                        /*
                        -----------------------------------------
                        Build object for phase engine
                        -----------------------------------------
                        */

                        const issueForEngine = {

                            ...issue,

                            assigned_to:
                                finalAssignedTo,

                            resolution_note:
                                finalResolutionNote

                        };

                        /*
                        -----------------------------------------
                        Server-side phase validation
                        -----------------------------------------
                        */

                        const validation =
                            evaluatePhase({

                                currentPhase:
                                    issue.phase,

                                nextPhase:
                                    phase,

                                issue:
                                    issueForEngine,

                                actor:
                                    req.user._id

                            });

                        if (!validation.ok) {

                            const error =
                                new Error(
                                    validation.message
                                );

                            error.status = 400;

                            throw error;

                        }

                        /*
                        -----------------------------------------
                        Conditions
                        -----------------------------------------
                        */

                        const conditions =
                            buildConditions({

                                issue:
                                    issueForEngine,

                                phase

                            });

                        /*
                        -----------------------------------------
                        Update issue
                        -----------------------------------------
                        */

                        const resolvedAt =
                            phase === PHASES.RESOLVED
                                ? "COALESCE(resolved_at, NOW())"
                                : "resolved_at";

                        const updateResult =
                            await client.query(
                                `
                                UPDATE issues

                                SET
                                    assigned_to = $1,

                                    resolution_note = $2,

                                    phase = $3,

                                    status = $3,

                                    conditions = $4::jsonb,

                                    resolved_at =
                                        ${resolvedAt},

                                    updated_at = NOW()

                                WHERE id = $5

                                RETURNING *
                                `,
                                [
                                    finalAssignedTo,
                                    finalResolutionNote,
                                    phase,
                                    JSON.stringify(
                                        conditions
                                    ),
                                    req.params.id
                                ]
                            );

                        const updatedIssue =
                            updateResult.rows[0];

                        /*
                        -----------------------------------------
                        Audit trail
                        -----------------------------------------
                        */

                        await client.query(
                            `
                            INSERT INTO status_history
                            (
                                issue_id,
                                status,
                                phase,
                                changed_by,
                                remarks,
                                conditions
                            )

                            VALUES
                            (
                                $1,
                                $2,
                                $3,
                                $4,
                                $5,
                                $6::jsonb
                            )
                            `,
                            [
                                updatedIssue.id,
                                phase,
                                phase,
                                req.user._id,
                                finalResolutionNote ||
                                    `Phase changed to ${phase}`,
                                JSON.stringify(
                                    conditions
                                )
                            ]
                        );

                        /*
                        -----------------------------------------
                        Get complete response object
                        -----------------------------------------
                        */

                        const fullResult =
                            await client.query(
                                `
                                SELECT
                                    i.*,

                                    json_build_object(
                                        'id', reporter.id,
                                        'name', reporter.name,
                                        'email', reporter.email
                                    ) AS "reportedBy",

                                    CASE
                                        WHEN officer.id IS NOT NULL
                                        THEN json_build_object(
                                            'id', officer.id,
                                            'name', officer.name,
                                            'email', officer.email
                                        )
                                        ELSE NULL
                                    END AS "assignedTo"

                                FROM issues i

                                JOIN users reporter
                                    ON reporter.id =
                                        i.reported_by

                                LEFT JOIN users officer
                                    ON officer.id =
                                        i.assigned_to

                                WHERE i.id = $1
                                `,
                                [req.params.id]
                            );

                        return fullResult.rows[0];

                    }
                );

            /*
            -----------------------------------------
            Notification
            -----------------------------------------
            */

            if (result?.reportedBy?.email) {

                await sendNotification({

                    to:
                        result.reportedBy.email,

                    subject:
                        `CivicConnect: ${result.issue_code} updated`,

                    text:
                        `Your civic issue "${result.title}" is now ${result.phase}.`
                });

            }

            res.json({
                issue: result
            });

        } catch (error) {

            next(error);

        }

    }
);

export default router;
