import axios from 'axios';

// Get your API Gateway Invoke URL from the AWS Console.
// It will look similar to this: https://[your-api-id].execute-api.[region].amazonaws.com/[stage-name]
const API_GATEWAY_URL = "https://bkblnd3xql.execute-api.ap-southeast-1.amazonaws.com/prod";

export async function fetchResumeSummary(bucket, key) {
  try {
    const res = await axios.post(
      `${API_GATEWAY_URL}/summarize-resume/${bucket}/${key}`
    );
    return res.data;
  } catch (err) {
    console.error("Error fetching resume summary:", err.response?.data || err.message);
    throw err;
  }
}