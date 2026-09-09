import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

import pool from "./src/config/db.js";
import analyticsRoutes from "./src/routes/analytics.routes.js";
import authRoutes from "./src/routes/auth.routes.js";
import postRoutes from "./src/routes/post.routes.js";
import connectionRoutes from "./src/routes/connection.routes.js";
import profileRoutes from "./src/routes/profile.routes.js";
import searchRoutes from "./src/routes/search.routes.js";
import uploadRoutes from "./src/routes/upload.routes.js";
import notificationRoutes from "./src/routes/notification.routes.js";
import messageRoutes from "./src/routes/message.routes.js";
import { errorHandler, notFound } from "./src/middleware/error.middleware.js";
import { initSocket } from "./src/socket/index.js";
import activityRoutes from "./src/routes/activity.routes.js";
import certificateRoutes from "./src/routes/certificate.routes.js";
import projectRoutes from "./src/routes/project.routes.js";
import skillRoutes from "./src/routes/skill.routes.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  },
});

app.set("io", io);

// ---- Middleware (always before routes) ----
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(compression());
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 100 : 1000,
  message: "Too many requests, please try again later",
});
app.use("/api", limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 10 : 300,
  message: "Too many auth attempts, please try again later",
});
app.use("/api/auth", authLimiter);

// ---- Routes (always after middleware) ----
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "LinkedIn Clone API running" });
});

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ status: "ok", db: "connected" });
  } catch (error) {
    res.status(503).json({ status: "error", db: "disconnected" });
  }
});

// ---- Error handlers (always last) ----
app.use(notFound);
app.use(errorHandler);

// ---- Socket.io ----
initSocket(io);

// ---- Start server (skip in test environment — Supertest spins its own) ----
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  httpServer.listen(PORT, () => {
    console.log(`Server started on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
  });
}

// ---- Graceful shutdown ----
const shutdown = (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  httpServer.close(() => {
    console.log("HTTP server closed");
    pool.end(() => {
      console.log("Database pool closed");
      process.exit(0);
    });
  });
  setTimeout(() => process.exit(1), 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  httpServer.close(() => process.exit(1));
});

export default app;