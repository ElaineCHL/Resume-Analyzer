import * as fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import Util from '../utils.js';

export const docToPdf = async (req, res) => {
  const file = req.file;

  // Use system temp directory or current working directory
  const tempOutputDir = path.dirname(file.path);
  const uploadedBaseName = path.parse(file.filename).name;
  const convertedFilePath = path.join(tempOutputDir, `${uploadedBaseName}.pdf`);

  try {
    await new Promise((resolve, reject) => {
      exec(`soffice --headless --convert-to pdf --outdir "${tempOutputDir}" "${file.path}"`, (err) => {
        if (err) return reject(err);
        resolve(true);
      });
    });

    if (!fs.existsSync(convertedFilePath)) {
      throw new Error(`Converted PDF not found: ${convertedFilePath}`);
    }

    const pdfBuffer = fs.readFileSync(convertedFilePath);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${path.parse(file.originalname).name}.pdf"`,
    });

    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Conversion failed',
      error: err.message,
    });
  } finally {
    // Clean up files
    if (file?.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    if (fs.existsSync(convertedFilePath)) fs.unlinkSync(convertedFilePath);
  }
};
