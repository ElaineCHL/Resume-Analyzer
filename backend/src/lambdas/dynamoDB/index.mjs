import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const s3 = new S3Client({});
const dynamoDB = new DynamoDBClient({});

// Convert stream to string
const streamToString = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });

// Keywords
const REQUIRED = ["C++", "MySQL", "Excel", "PowerPoint", "Python", "C#", "JavaScript"]; // TODO: make dynamic

export const handler = async (event) => {
  try {
    const fileObj = event.Records[0];
    const bucket = fileObj.s3.bucket.name;
    const key = decodeURIComponent(fileObj.s3.object.key.replace(/\+/g, " "));

    console.log(`Processing file: s3://${bucket}/${key}`);

    // Get object from S3
    const s3Object = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));

    // Extract jobId from metadata
    const jobId = s3Object.Metadata?.jobid;
    if (!jobId) {
      throw new Error("No jobId found in S3 metadata");
    }

    // Parse the JSON content
    const bodyString = await streamToString(s3Object.Body);
    const structured = JSON.parse(bodyString);

    console.debug("Structured", structured);

    // Extract candidate info
    const { data, metadata } = structured;
    if (!data) {
      throw new Error("No candidate data found in file");
    }

    const {
      candidateID,
      name,
      email,
      phone,
      skills = [],
      education = [],
      experience = [],
    } = data;

    if (!candidateID) {
      throw new Error("CandidateID missing in structured data");
    }

    // Calculate score based on REQUIRED skills
    let matched = [];
    let score = 0;
    REQUIRED.forEach((keyword) => {
      if (skills.some((skill) => skill.toLowerCase().includes(keyword.toLowerCase()))) {
        matched.push(keyword);
        score++;
      }
    });

    // Build DynamoDB item
    const item = {
      jobID: { S: jobId },
      SK: { S: `CANDIDATE#${candidateID}` },
      name: { S: name || "Unknown" },
      email: { S: email || "N/A" },
      phone: { S: phone || "N/A" },
      score: { N: score.toString() },
      skills: { S: JSON.stringify(skills) },
      education: { S: JSON.stringify(education) },
      experience: { S: JSON.stringify(experience) },
      matchedCriteria: { S: JSON.stringify(matched) },
      createdAt: { S: new Date().toISOString() },
    };

    // Save to DynamoDB
    await dynamoDB.send(
      new PutItemCommand({
        TableName: "JobCandidates",
        Item: item,
      })
    );

    console.log("Candidate saved to DynamoDB:", candidateID);

    return { statusCode: 200, body: "Scoring and save complete." };
  } catch (err) {
    console.error("Error processing candidate:", err);
    return { statusCode: 500, body: `Error: ${err.message}` };
  }
};
