import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { config } from "./utils/config";
import authRouter from "./routes/auth.route";
import materialRouter from "./routes/material.route";
import examRouter from "./routes/exam.route";
import missionRouter from "./routes/mission.route";
import { HttpException } from "./utils/exceptions";

// Create Hono app
const app = new Hono();

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);

// Health check endpoint
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "EnglishLab API",
    environment: config.nodeEnv,
  });
});

// API routes
app.route("/api/auth", authRouter);
app.route("/api/materials", materialRouter);
app.route("/api/exams", examRouter);
app.route("/api/missions", missionRouter);

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

// Error handler
app.onError((err, c) => {
  // Handle custom HTTP exceptions
  if (err instanceof HttpException) {
    return c.json({ error: err.message }, err.statusCode);
  }

  // Handle Zod validation errors
  if (err.name === "ZodError") {
    return c.json({ error: "Validation failed", details: err }, 400);
  }

  // Handle unknown errors
  console.error("Server error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

// Start server
console.log(`🚀 Server starting on port ${config.port}`);
console.log(`📚 Environment: ${config.nodeEnv}`);

serve({
  fetch: app.fetch,
  port: config.port,
});
