import * as fs from 'fs';
import express from "express"
import multer from 'multer';
import Util from "./utils.js";
import { generatePresignedUrl } from "./controller/getPresignedUrl.js";
import { docToPdf } from "./controller/docToPdf.js";
import { fetchScores } from "./controller/fetchScores.js";

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

Util.ensureDirectoryExists('uploads/');

router.get("/get-presigned-url", generatePresignedUrl);
router.post("/convert-doc-to-pdf", upload.single('file'), docToPdf);
router.get("/jobs/:jobId", fetchScores);

export default router;