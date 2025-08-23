import path from "path";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
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

    console.debug(`Bucket: ${bucketname} | Key: ${filename}`);

    // Get the object from S3 including metadata
    const s3Object = await s3.send(new GetObjectCommand({
      Bucket: bucketname,
      Key: filename,
    }));

    const metadata = s3Object.Metadata || {};
    console.debug("Metadata:", metadata);

    const rawText = await extractTextFromS3(bucketname, filename);
    const cleaned = cleanLines(rawText);
    const structured = extractFieldsFromText(cleaned);

    // Combine structured data with metadata
    const result = {
      filename,
      metadata,       // include metadata
      data: structured
    };

    console.debug("Extracted text:", structured);

    // Build output file name (replace .pdf with .json)
    const baseName = path.basename(filename, path.extname(filename));
    const outputKey = `output/${baseName}.json`;

    // Save to S3
    await s3.send(
      new PutObjectCommand({
        Bucket: bucketname,
        Key: outputKey,
        Body: JSON.stringify(result, null, 2),
        Metadata: metadata // optional: copy metadata to the output file too
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
