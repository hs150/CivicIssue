import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  issueId: { type: mongoose.Schema.Types.ObjectId, ref: "Issue", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true, maxlength: 1000 }
}, { timestamps: true });

export default mongoose.model("Comment", commentSchema);
