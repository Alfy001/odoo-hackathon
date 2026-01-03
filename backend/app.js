import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/userroutes.js";
import tripRoutes from "./routes/triproutes.js";

dotenv.config();

const app = express();

/**
 * Middlewares
 */
app.use(cors());
app.use(express.json());

/**
 * Routes
 */
app.use("/api/users", userRoutes);
app.use("/api/trips", tripRoutes);

/**
 * Health check
 */
app.get("/", (req, res) => {
  res.status(200).json({ message: "API running successfully" });
});

export default app;
