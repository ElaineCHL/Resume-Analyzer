import express from "express";
import multer from 'multer';
import Util from "./utils.js";
import { generatePresignedUrl } from "./controller/getPresignedUrl.js";
import { docToPdf } from "./controller/docToPdf.js";
import { fetchScores, createJob, fetchAllJobs } from "./controller/fetchScores.js";

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

Util.ensureDirectoryExists('uploads/');

router.get("/get-presigned-url", generatePresignedUrl);
router.post("/convert-doc-to-pdf", upload.single('file'), docToPdf);

export default router;