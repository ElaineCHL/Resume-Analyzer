import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { extractTextFromS3, cleanLines, extractFieldsFromText } from './handler.mjs';

const s3 = new S3Client({});

export const handler = async (event) => {
  try {
    if (!event.Records) {
      return { statusCode: 400, body: "No S3 event records found" };
    }

    const fileObj = event.Records[0];
    const bucketname = fileObj.s3.bucket.name;
    const filename = decodeURIComponent(fileObj.s3.object.key.replace(/\+/g, " "));

    console.log(`Bucket: ${bucketname} | Key: ${filename}`);

    const rawText = await extractTextFromS3(bucketname, filename);
    const cleaned = cleanLines(rawText);
    const structured = extractFieldsFromText(cleaned);
    const result = { filename, data: structured };

    console.log("Extracted text:", structured);

    // Build output file name (replace .pdf with .txt)
    const baseName = filename.replace(/\.[^/.]+$/, ""); // remove extension
    const outputKey = `output/${baseName}.txt`;

    // Save to S3
    await s3.send(
      new PutObjectCommand({
        Bucket: bucketname,
        Key: outputKey,
        Body: JSON.stringify(structured, null, 2),
      })
    );

    console.log(`Saved extracted text to ${outputKey}`);

    return {
      statusCode: 200,
      body: "Document processed successfully!",
    };
  } catch (err) {
    console.error("Error:", err.message);
    return {
      statusCode: 500,
      body: "Error processing the document",
    };
  }
};
