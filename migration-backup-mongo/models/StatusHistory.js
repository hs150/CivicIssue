import mongoose from "mongoose";

const statusHistorySchema = new mongoose.Schema({
  issueId: { type: mongoose.Schema.Types.ObjectId, ref: "Issue", required: true },
  status: { type: String, required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  remarks: String
}, { timestamps: true });

export default mongoose.model("StatusHistory", statusHistorySchema);
