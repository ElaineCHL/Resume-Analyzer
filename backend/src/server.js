import dotenv from "dotenv";
dotenv.config(); // Load environment variables

import cors from "cors";
import express from "express";
import apiRoutes from "./apiRoutes.js";

const app = express();
const PORT = process.env.PORT || 5001;

// middlewares
app.use(cors());
app.use(express.json()); // parse JSON bodies
app.use("/api", apiRoutes);

app.listen(PORT, () => {
  console.log("Server started on PORT: " + PORT);
});