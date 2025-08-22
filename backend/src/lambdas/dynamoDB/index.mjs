import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { S3RequestPresigner } from "@aws-sdk/s3-request-presigner";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "stream";

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

    console.log(`Scoring file: s3://${bucket}/${key}`);

    // Get structured JSON from S3
    const data = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const bodyString = await streamToString(data.Body);
    const structured = JSON.parse(bodyString);

    console.debug("Structured:", structured);

    const {
      candidateID,
      name,
      email,
      phone,
      skills = [],
      education = [],
      experience = [],
    } = structured;

    // Keyword Matching
    let matched = [];
    let score = 0;
    REQUIRED.forEach((keyword) => {
      if (skills.some((skill) => skill.toLowerCase().includes(keyword.toLowerCase()))) {
        matched.push(keyword);
        score++;
      }
    });

    const result = {
      JobID: "JD12345", // TODO: make dynamic
      CandidateID: candidateID,
      Name: name || "Unknown",
      Email: email || "N/A",
      Phone: phone || "N/A",
      Skills: skills,
      Education: education,
      Experience: experience,
      Score: score,
      MatchedCriteria: matched,
    };


    // Save to DynamoDB
    await dynamoDB.send(
      new PutItemCommand({
        TableName: "JobCandidates",
        Item: {
          jobID: { S: result.JobID },
          sortKey: { S: `${result.Score}#${result.CandidateID}` },
          candidateID: { S: result.CandidateID },
          name: { S: result.Name },
          email: { S: result.Email },
          phone: { S: result.Phone },
          score: { N: result.Score.toString() },
          skills: { S: JSON.stringify(result.Skills) },
          education: { S: JSON.stringify(result.Education) },
          experience: { S: JSON.stringify(result.Experience) },
          matchedCriteria: { S: JSON.stringify(result.MatchedCriteria) },
        },
      })
    );
    console.debug("Saved to DynamoDB");

    return { statusCode: 200, body: "Scoring complete." };
  } catch (err) {
    console.error("Error scoring candidate:", err);
    return { statusCode: 500, body: "Error in scoring-lambda" };
  }
};
