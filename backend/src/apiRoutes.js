import express from "express"
import { generatePresignedUrl } from "./controller/getPresignedUrl.js";

const router = express.Router();

router.get("/get-presigned-url", generatePresignedUrl);

export default router;