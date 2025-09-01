import express from "express";
import multer from 'multer';
import Util from "./utils.js";
import { generatePresignedUrl } from "./controller/getPresignedUrl.js";
import { docToPdf } from "./controller/docToPdf.js";
import { fetchScores, createJob, fetchAllJobs } from "./controller/fetchScores.js";

import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

const router = express.Router();
const upload = multer({ dest: 'uploads/' });
const lambdaClient = new LambdaClient({});

Util.ensureDirectoryExists('uploads/');

// Your existing routes
router.get("/get-presigned-url", generatePresignedUrl);
router.post("/convert-doc-to-pdf", upload.single('file'), docToPdf);
router.get("/jobs", fetchAllJobs);
router.get("/jobs/:jobId", fetchScores);
router.post("/jobs", createJob);

// The corrected route to invoke your Bedrock Lambda function
router.get("/summarize-resume", async (req, res) => {
    try {
        const { bucketName, s3Key } = req.query;
        
        const payload = {
            pathParameters: {
                bucketName: bucketName,
                s3Key: s3Key
            }
        };

        const command = new InvokeCommand({
            FunctionName: "BedrockResumeSummarizer", // REPLACE WITH YOUR LAMBDA FUNCTION NAME
            Payload: JSON.stringify(payload),
        });

        const response = await lambdaClient.send(command);
        const result = JSON.parse(Buffer.from(response.Payload).toString());

        if (result.statusCode === 200) {
            res.status(200).json(JSON.parse(result.body));
        } else {
            res.status(result.statusCode).json(JSON.parse(result.body));
        }

    } catch (error) {
        console.error("Error invoking Lambda:", error);
        res.status(500).json({ error: "Failed to generate summary." });
    }
});

export default router;