import mongoose from "mongoose";

const issueSchema = new mongoose.Schema({
  issueCode: { type: String, unique: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, maxlength: 2000 },
  category: { type: String, required: true },
  department: { type: String, required: true },
  imageUrl: String,
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: String
  },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  status: {
    type: String,
    enum: ["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"],
    default: "NEW"
  },
  priority: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
    default: "LOW"
  },
  priorityScore: { type: Number, default: 0 },
  upvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  resolutionNote: String,
  resolvedAt: Date
}, { timestamps: true });

issueSchema.index({
  "location.latitude": 1,
  "location.longitude": 1,
  category: 1
});

export default mongoose.model("Issue", issueSchema);
