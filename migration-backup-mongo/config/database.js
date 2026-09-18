import mongoose from "mongoose";

export async function connectDatabase() {
  if (!process.env.MONGO_URI) return false;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");
    return true;
  } catch (error) {
    console.error("MongoDB connection failed. Falling back to demo mode:", error.message);
    delete process.env.MONGO_URI;
    return false;
  }
}
