import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/userroutes.js";

dotenv.config();

const app = express();

/**
 * Middlewares
 */
app.use(express.json());

/**
 * Routes
 */
app.use("/api/users", userRoutes);

/**
 * Health check
 */
app.get("/", (req, res) => {
  res.status(200).json({ message: "API running successfully" });
});

export default app;
