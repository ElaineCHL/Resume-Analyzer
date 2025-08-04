import express from 'express';
import { extractTextFromS3, cleanLines, extractFieldsFromText } from '../services/textractService.js';

const router = express.Router();

router.post('/analyze-all', async (req, res) => {
  const { files } = req.body;

  if (!Array.isArray(files)) {
    return res.status(400).json({ error: 'files must be an array of filenames' });
  }

  try {
    const results = await Promise.all(
      files.map(async (fileName) => {
        try {
          const rawText = await extractTextFromS3(fileName);
          const cleaned = cleanLines(rawText);
          const structured = extractFieldsFromText(cleaned);
          return { fileName, data: structured };
        } catch (err) {
          return { fileName, error: err.message };
        }
      })
    );

    res.send(JSON.stringify({ results }, null, 2)); // 2 = indentation level
  } catch (err) {
    res.status(500).json({ error: 'Unexpected error', details: err });
  }
});

export default router;
