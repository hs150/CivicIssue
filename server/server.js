import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import { seedDemoData } from "./utils/demoStore.js";

const PORT = process.env.PORT || 5000;

async function start() {
  const dbConnected = await connectDatabase();

  if (!dbConnected) {
    seedDemoData();
    console.log("Running CivicConnect in DEMO MODE (in-memory data).");
  }

  app.listen(PORT, () => {
    console.log(`CivicConnect API running on http://localhost:${PORT}`);
  });
}

start();
