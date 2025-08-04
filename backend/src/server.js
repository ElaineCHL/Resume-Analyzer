import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./apiRoutes.js";
import resumeRoutes from "../routes/resume.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", apiRoutes);
app.use("/api/resume", resumeRoutes);

app.listen(PORT, () => {
  console.log(`✅ Server started on PORT: ${PORT}`);
});
