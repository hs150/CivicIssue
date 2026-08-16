import { Router } from "express";
import { randomUUID } from "crypto";
import Issue from "../models/Issue.js";
import User from "../models/User.js";
import StatusHistory from "../models/StatusHistory.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { calculatePriority } from "../constants.js";
import { sendNotification } from "../services/notify.js";
import { demo, getDemoUser } from "../utils/demoStore.js";

const router = Router();

router.use(requireAuth, requireRole("officer", "admin"));

router.get("/stats", async (req, res, next) => {
  try {
    if (process.env.MONGO_URI) {
      const [total, newCount, progress, resolved, closed] = await Promise.all([
        Issue.countDocuments(),
        Issue.countDocuments({ status: "NEW" }),
        Issue.countDocuments({ status: "IN_PROGRESS" }),
        Issue.countDocuments({ status: "RESOLVED" }),
        Issue.countDocuments({ status: "CLOSED" })
      ]);
      return res.json({ stats: { total, new: newCount, inProgress: progress, resolved, closed } });
    }

    const stats = {
      total: demo.issues.length,
      new: demo.issues.filter(i => i.status === "NEW").length,
      inProgress: demo.issues.filter(i => i.status === "IN_PROGRESS").length,
      resolved: demo.issues.filter(i => i.status === "RESOLVED").length,
      closed: demo.issues.filter(i => i.status === "CLOSED").length
    };
    res.json({ stats });
  } catch (error) {
    next(error);
  }
});

router.get("/issues", async (req, res, next) => {
  try {
    if (process.env.MONGO_URI) {
      const issues = await Issue.find()
        .populate("reportedBy", "name email")
        .populate("assignedTo", "name email")
        .sort({ priorityScore: -1, createdAt: -1 })
        .limit(200);
      return res.json({ issues });
    }

    res.json({ issues: [...demo.issues].sort((a, b) => b.priorityScore - a.priorityScore) });
  } catch (error) {
    next(error);
  }
});

router.patch("/issues/:id", async (req, res, next) => {
  try {
    const { status, assignedTo, resolutionNote } = req.body;
    const allowed = ["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"];

    if (status && !allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    if (process.env.MONGO_URI) {
      const issue = await Issue.findById(req.params.id).populate("reportedBy", "name email");
      if (!issue) return res.status(404).json({ message: "Issue not found." });

      if (assignedTo) {
        const officer = await User.findById(assignedTo);
        if (!officer) return res.status(404).json({ message: "Assigned officer not found." });
        issue.assignedTo = officer._id;
      }

      if (status) issue.status = status;
      if (resolutionNote !== undefined) issue.resolutionNote = resolutionNote;
      if (status === "RESOLVED" && !issue.resolvedAt) issue.resolvedAt = new Date();

      await issue.save();

      if (status) {
        await StatusHistory.create({
          issueId: issue._id,
          status,
          changedBy: req.user._id,
          remarks: resolutionNote || `Status changed to ${status}`
        });

        await sendNotification({
          to: issue.reportedBy?.email,
          subject: `CivicConnect: ${issue.issueCode} updated`,
          text: `Your issue "${issue.title}" is now ${status}. ${resolutionNote || ""}`
        });
      }

      return res.json({ issue });
    }

    const issue = demo.issues.find(i => i._id === req.params.id);
    if (!issue) return res.status(404).json({ message: "Issue not found." });

    if (assignedTo) issue.assignedTo = assignedTo;
    if (status) {
      issue.status = status;
      if (status === "RESOLVED") issue.resolvedAt = new Date().toISOString();

      demo.history.push({
        _id: randomUUID(),
        issueId: issue._id,
        status,
        changedBy: req.user._id,
        remarks: resolutionNote || `Status changed to ${status}`,
        createdAt: new Date().toISOString()
      });
    }
    if (resolutionNote !== undefined) issue.resolutionNote = resolutionNote;
    issue.updatedAt = new Date().toISOString();

    res.json({ issue });
  } catch (error) {
    next(error);
  }
});

export default router;
