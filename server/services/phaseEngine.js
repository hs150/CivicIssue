export const PHASES = Object.freeze({

    NEW: "NEW",

    IN_PROGRESS: "IN_PROGRESS",

    RESOLUTION_REVIEW: "RESOLUTION_REVIEW",

    RESOLVED: "RESOLVED",

    CLOSED: "CLOSED",

    REJECTED: "REJECTED"

});

const TRANSITIONS = Object.freeze({

    NEW: [
        PHASES.IN_PROGRESS,
        PHASES.REJECTED
    ],

    IN_PROGRESS: [
        PHASES.IN_PROGRESS,
        PHASES.RESOLUTION_REVIEW,
        PHASES.REJECTED
    ],

    RESOLUTION_REVIEW: [
        PHASES.RESOLUTION_REVIEW,
        PHASES.RESOLVED,
        PHASES.IN_PROGRESS
    ],

    RESOLVED: [
        PHASES.RESOLVED,
        PHASES.CLOSED,
        PHASES.IN_PROGRESS
    ],

    CLOSED: [],

    REJECTED: [
        PHASES.IN_PROGRESS
    ]

});

export function evaluatePhase({
    currentPhase,
    nextPhase,
    issue,
    actor
}) {

    if (!Object.values(PHASES).includes(nextPhase)) {

        return {
            ok: false,
            message: `Unknown phase: ${nextPhase}`
        };

    }

    const allowed =
        TRANSITIONS[currentPhase] || [];

    if (!allowed.includes(nextPhase)) {

        return {
            ok: false,
            message:
                `Invalid transition: ${currentPhase} -> ${nextPhase}`
        };

    }

    if (
        nextPhase === PHASES.IN_PROGRESS &&
        !issue.assigned_to &&
        !actor
    ) {

        return {
            ok: false,
            message:
                "An officer must be assigned before work can begin."
        };

    }

    if (
        nextPhase === PHASES.RESOLUTION_REVIEW
    ) {

        if (!issue.assigned_to) {

            return {
                ok: false,
                message:
                    "An officer must be assigned."
            };

        }

        if (!issue.resolution_note?.trim()) {

            return {
                ok: false,
                message:
                    "Resolution note is required."
            };

        }

    }

    if (
        nextPhase === PHASES.RESOLVED
    ) {

        if (
            currentPhase !==
            PHASES.RESOLUTION_REVIEW
        ) {

            return {
                ok: false,
                message:
                    "Issue must pass resolution review first."
            };

        }

        if (!issue.resolution_note?.trim()) {

            return {
                ok: false,
                message:
                    "Resolution evidence is required."
            };

        }

    }

    if (
        nextPhase === PHASES.CLOSED &&
        currentPhase !== PHASES.RESOLVED
    ) {

        return {
            ok: false,
            message:
                "Only resolved issues can be closed."
        };

    }

    return {
        ok: true,
        phase: nextPhase
    };

}

export function buildConditions({
    issue,
    phase
}) {

    const reportValid =
        Boolean(issue.title?.trim()) &&
        Boolean(issue.description?.trim()) &&
        Boolean(issue.category) &&
        Number.isFinite(
            Number(issue.latitude)
        ) &&
        Number.isFinite(
            Number(issue.longitude)
        );

    const officerAssigned =
        Boolean(issue.assigned_to);

    const resolutionProvided =
        Boolean(
            issue.resolution_note?.trim()
        );

    return {

        report: {
            passed: reportValid
        },

        officerAssignment: {
            passed: officerAssigned
        },

        resolution: {
            passed: resolutionProvided
        },

        phase,

        evaluatedAt:
            new Date().toISOString()

    };

}
