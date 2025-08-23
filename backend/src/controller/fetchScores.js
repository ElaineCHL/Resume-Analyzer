import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

export const fetchScores = async (req, res) => {
  const region = process.env.AWS_REGION;
  const client = new DynamoDBClient({ region });
  const docClient = DynamoDBDocumentClient.from(client);

  const jobId = req.params.jobId;

  const params = {
    TableName: "JobCandidates",
    KeyConditionExpression: "jobID = :jobId",
    ExpressionAttributeValues: {
      ":jobId": jobId,
    },
  };

  try {
    const data = await docClient.send(new QueryCommand(params));


    // separate candidates and job record
    const jobItem = data.Items.find(item => item.SK === "JOB");
    const candidates = data.Items
      .filter(item => item.SK.startsWith("CANDIDATE#"))
      .sort((a, b) => b.score - a.score);

    // check if job record exists
    if (!jobItem) {
      return res.status(404).json({ error: `Job with ID ${jobId} not found.` });
    }

    const response = {
      jobID: jobId,
      title: jobItem.jobTitle,
      description: jobItem.description,
      candidates,
    };
    res.status(200).json(response);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createJob = async (req, res) => {
  const { jobTitle, description } = req.body;

  if (!jobTitle || !description) {
    return res.status(400).json({ error: "Missing fields: jobTitle and description are required." });
  }

  const jobItem = {
    jobID: `J_${uuidv4()}`, // partition key (PK)
    SK: "JOB",
    jobTitle,
    description,
    createdAt: new Date().toISOString(),
  };
  try {
    await docClient.send(
      new PutCommand({
        TableName: "JobCandidates",
        Item: jobItem,
      })
    )

    res.status(200).json(jobItem);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to create job: ", error });
  }
};

export const fetchAllJobs = async (req, res) => {
  const params = {
    TableName: "JobCandidates",
    FilterExpression: "#sk = :jobSK",
    ExpressionAttributeNames: {
      "#sk": "SK",
    },
    ExpressionAttributeValues: {
      ":jobSK": { S: "JOB" },
    },
  };

  try {
    const data = await client.send(new ScanCommand(params));
    const jobs = data.Items.map(item => ({
      jobID: item.jobID.S,
      jobTitle: item.jobTitle?.S,
      description: item.description?.S,
      createdAt: item.createdAt?.S,
    }));
    res.status(200).json(jobs);
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({ error: "Failed to fetch job: ", error });
  }
};