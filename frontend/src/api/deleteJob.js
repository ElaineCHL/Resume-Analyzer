import { apiGateway } from '../lib/axios.js';

export async function deleteJob(jobId) {
  try {
    const res = await apiGateway.delete(`/jobs/${jobId}`);
    return res.data;
  } catch (err) {
    console.error("Error in deleteJob:", err.response?.data || err.message);
    throw err;
  }
}