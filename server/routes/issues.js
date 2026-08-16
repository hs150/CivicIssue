import { Router } from "express";
import multer from "multer";
import { randomUUID } from "crypto";
import Issue from "../models/Issue.js";
import Comment from "../models/Comment.js";
import StatusHistory from "../models/StatusHistory.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { categoryInfo, calculatePriority } from "../constants.js";
import { uploadImage } from "../services/storage.js";
import { sendNotification } from "../services/notify.js";
import { buildIssueFields, distanceMeters } from "../services/issueService.js";
import { demo, getDemoUser, publicUser } from "../utils/demoStore.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, /^image\/(jpeg|png|webp|jpg)$/.test(file.mimetype));
  }
});

function normalizeIssue(issue) {
  if (!issue) return null;
  const raw = issue.toObject ? issue.toObject() : issue;
  return {
    ...raw,
    reporter: raw.reportedBy?.name ? raw.reportedBy : undefined,
    assignedOfficer: raw.assignedTo?.name ? raw.assignedTo : undefined
  };
}

async function findSimilar({ category, latitude, longitude, excludeId }) {
  if (!latitude || !longitude) return [];

  if (process.env.MONGO_URI) {
    const issues = await Issue.find({ category, status: { $ne: "CLOSED" } })
      .limit(50)
      .lean();
    return issues.filter(i =>
      i._id.toString() !== excludeId &&
      distanceMeters(i.location, { latitude, longitude }) <= 100
    );
  }

  return demo.issues.filter(i =>
    i.category === category &&
    i._id !== excludeId &&
    i.status !== "CLOSED" &&
    distanceMeters(i.location, { latitude, longitude }) <= 100
  );
}

router.get("/", async (req, res, next) => {
  try {
    const { status, category, mine, search } = req.query;

    if (process.env.MONGO_URI) {
      const filter = {};
      if (status) filter.status = status;
      if (category) filter.category = category;
      if (search) filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
      if (mine && req.headers.authorization) {
        const auth = req.headers.authorization.slice(7);
        // Mine is handled by the frontend through the dedicated authenticated filter below.
        filter.reportedBy = req.query.userId || undefined;
        if (!filter.reportedBy) delete filter.reportedBy;
      }

      const issues = await Issue.find(filter)
        .populate("reportedBy", "name email")
        .populate("assignedTo", "name email")
        .sort({ createdAt: -1 })
        .limit(100);

      return res.json({ issues: issues.map(normalizeIssue) });
    }

    let issues = [...demo.issues];
    if (status) issues = issues.filter(i => i.status === status);
    if (category) issues = issues.filter(i => i.category === category);
    if (search) {
      const q = search.toLowerCase();
      issues = issues.filter(i => `${i.title} ${i.description}`.toLowerCase().includes(q));
    }
    if (mine) issues = issues.filter(i => i.reportedBy === req.query.userId);
    return res.json({ issues });
  } catch (error) {
    next(error);
  }
});

router.get("/mine", requireAuth, async (req, res, next) => {
  try {
    if (process.env.MONGO_URI) {
      const issues = await Issue.find({ reportedBy: req.user._id })
        .populate("reportedBy", "name email")
        .populate("assignedTo", "name email")
        .sort({ createdAt: -1 });
      return res.json({ issues: issues.map(normalizeIssue) });
    }

    return res.json({ issues: demo.issues.filter(i => i.reportedBy === req.user._id) });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (process.env.MONGO_URI) {
      const issue = await Issue.findById(req.params.id)
        .populate("reportedBy", "name email")
        .populate("assignedTo", "name email");
      if (!issue) return res.status(404).json({ message: "Issue not found." });

      const comments = await Comment.find({ issueId: issue._id })
        .populate("userId", "name role")
        .sort({ createdAt: 1 });
      const history = await StatusHistory.find({ issueId: issue._id })
        .populate("changedBy", "name role")
        .sort({ createdAt: 1 });

      return res.json({ issue: normalizeIssue(issue), comments, history });
    }

    const issue = demo.issues.find(i => i._id === req.params.id);
    if (!issue) return res.status(404).json({ message: "Issue not found." });

    const comments = demo.comments
      .filter(c => c.issueId === issue._id)
      .map(c => ({ ...c, userId: publicUser(getDemoUser(c.userId)) }));
    const history = demo.history.filter(h => h.issueId === issue._id);

    res.json({ issue, comments, history });
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, upload.single("image"), async (req, res, next) => {
  try {
    const { title, description, category, latitude, longitude, address } = req.body;

    if (!title || !description || !category || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: "Title, description, category and location are required." });
    }

    const imageUrl = await uploadImage(req.file);
    const similar = await findSimilar({ category, latitude: Number(latitude), longitude: Number(longitude) });
    const fields = buildIssueFields({ category, upvotes: 0 });
    const issueCode = `CC-${Math.floor(1000 + Math.random() * 9000)}`;

    if (process.env.MONGO_URI) {
      const issue = await Issue.create({
        issueCode,
        title,
        description,
        ...fields,
        imageUrl,
        location: { latitude: Number(latitude), longitude: Number(longitude), address },
        reportedBy: req.user._id
      });

      await StatusHistory.create({
        issueId: issue._id,
        status: "NEW",
        changedBy: req.user._id,
        remarks: "Issue reported"
      });

      await sendNotification({
        to: req.user.email,
        subject: `CivicConnect: ${issue.issueCode} received`,
        text: `Your civic issue "${issue.title}" has been received and is now NEW.`
      });

      return res.status(201).json({ issue, similarIssues: similar });
    }

    const issue = {
      _id: randomUUID(),
      issueCode,
      title,
      description,
      ...fields,
      imageUrl,
      location: { latitude: Number(latitude), longitude: Number(longitude), address },
      reportedBy: req.user._id,
      assignedTo: null,
      status: "NEW",
      upvotes: 0,
      upvotedBy: [],
      resolutionNote: "",
      resolvedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    demo.issues.unshift(issue);
    demo.history.push({
      _id: randomUUID(),
      issueId: issue._id,
      status: "NEW",
      changedBy: req.user._id,
      remarks: "Issue reported",
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ issue, similarIssues: similar });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/upvote", requireAuth, async (req, res, next) => {
  try {
    if (process.env.MONGO_URI) {
      const issue = await Issue.findById(req.params.id);
      if (!issue) return res.status(404).json({ message: "Issue not found." });

      const already = issue.upvotedBy.some(id => id.toString() === req.user._id.toString());
      if (already) {
        issue.upvotedBy = issue.upvotedBy.filter(id => id.toString() !== req.user._id.toString());
        issue.upvotes = Math.max(0, issue.upvotes - 1);
      } else {
        issue.upvotedBy.push(req.user._id);
        issue.upvotes += 1;
      }

      const p = calculatePriority(issue.category, issue.upvotes);
      issue.priority = p.label;
      issue.priorityScore = p.score;
      await issue.save();

      return res.json({ upvotes: issue.upvotes, priority: issue.priority });
    }

    const issue = demo.issues.find(i => i._id === req.params.id);
    if (!issue) return res.status(404).json({ message: "Issue not found." });

    const index = issue.upvotedBy.indexOf(req.user._id);
    if (index >= 0) {
      issue.upvotedBy.splice(index, 1);
      issue.upvotes = Math.max(0, issue.upvotes - 1);
    } else {
      issue.upvotedBy.push(req.user._id);
      issue.upvotes += 1;
    }

    const p = calculatePriority(issue.category, issue.upvotes);
    issue.priority = p.label;
    issue.priorityScore = p.score;
    res.json({ upvotes: issue.upvotes, priority: issue.priority });
  } catch (error) {
    next(error);
  }
});

router.get("/:id/comments", async (req, res, next) => {
  try {
    if (process.env.MONGO_URI) {
      const comments = await Comment.find({ issueId: req.params.id })
        .populate("userId", "name role")
        .sort({ createdAt: 1 });
      return res.json({ comments });
    }

    res.json({
      comments: demo.comments
        .filter(c => c.issueId === req.params.id)
        .map(c => ({ ...c, userId: publicUser(getDemoUser(c.userId)) }))
    });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/comments", requireAuth, async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: "Comment cannot be empty." });

    if (process.env.MONGO_URI) {
      const issue = await Issue.findById(req.params.id);
      if (!issue) return res.status(404).json({ message: "Issue not found." });

      const comment = await Comment.create({ issueId: issue._id, userId: req.user._id, text: text.trim() });
      await comment.populate("userId", "name role");
      return res.status(201).json({ comment });
    }

    const issue = demo.issues.find(i => i._id === req.params.id);
    if (!issue) return res.status(404).json({ message: "Issue not found." });

    const comment = {
      _id: randomUUID(),
      issueId: issue._id,
      userId: req.user._id,
      text: text.trim(),
      createdAt: new Date().toISOString()
    };
    demo.comments.push(comment);

    res.status(201).json({
      comment: { ...comment, userId: publicUser(getDemoUser(req.user._id)) }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
