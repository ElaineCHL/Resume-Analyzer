import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import apiRoutes from "./apiRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

// middlewares
app.use(cors());
app.use(express.json()); // parse JSON bodies
app.use("/api", apiRoutes);

app.listen(PORT, () => {
  console.log("Server started on PORT: " + PORT);
});