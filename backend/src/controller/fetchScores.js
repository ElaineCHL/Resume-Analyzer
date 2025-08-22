import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
  ScanCommand
} from "@aws-sdk/lib-dynamodb";

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

    let candidates = data.Items.map(item => ({ ...item, }));
    candidates.sort((a, b) => b.score - a.score); // sort in descending order

    const response = {
      jobID: jobId,
      title: "Software Engineer", // TODO: make dynamic
      candidates,
    };
    res.status(200).json(response);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
