import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import formRoutes from "./routes/formRoutes.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL })); // allow the Vite app
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/forms", formRoutes);

app.use((req, res) => res.status(404).json({ error: `No route for ${req.method} ${req.path}` }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err.name === "ValidationError") return res.status(400).json({ error: err.message });
  if (err.code === 11000) return res.status(409).json({ error: "A form with that slug already exists" });
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

// Surface anything that would otherwise kill the process without a message.
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
  process.exit(1);
});

const start = async () => {
  await connectDB();

  const server = app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Stop the other process (or change PORT in .env) and restart.`);
    } else {
      console.error("Server error:", err);
    }
    process.exit(1);
  });

  // Release the port and DB connection promptly so a restart never races the old process.
  const shutdown = () => {
    server.close(() => mongoose.disconnect().finally(() => process.exit(0)));
    setTimeout(() => process.exit(0), 2000).unref();
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

start();
