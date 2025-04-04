import express, { json } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { healthCheck } from "./controllers/healthcheck.controller.js";
import healthRouter from "./routes/healthcheck.route.js";
import userRouter from "./routes/user.routes.js";
import adminRouter from "./routes/admin.routes.js";
import { stripeWebHooks } from "./controllers/user.controller.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Health check route
app.get("/", (req, res) => {
  res.send("API is working fine");
});

app.post(
  "/webhook",
  express.raw({ type: "application/json" }), // Ensure raw parsing for Stripe webhook
  stripeWebHooks
);

app.get("/success", (req, res) => {
  res.send("Payment successful!");
});

app.get("/cancel", (req, res) => {
  res.send("Payment canceled!");
});

app.use("/api/v1/healthcheck", healthRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);

export default app; // Export app for Vercel to handle
