import express from "express";
import { connectDB } from "./database/mongodb.js";
import dotenv from "dotenv";
import app from "./app.js";  // Import your Express app

dotenv.config();
connectDB();

// You don't need to call app.listen() in serverless mode

export default app;  // Export app for Vercel to handle
