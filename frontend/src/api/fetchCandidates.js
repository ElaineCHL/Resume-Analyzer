import { apiGateway } from '../lib/axios.js';

export async function fetchJobWithCandidates(jobId) {
  try {
    const res = await apiGateway.get(`/jobs/${jobId}`);
    return res.data;
  } catch (err) {
    console.error("Error in fetchJobWithCandidates:", err.response?.data || err.message);
    throw err;
  }
}

export async function fetchTopCandidates(jobId, limit) {
  try {
    const res = await apiGateway.get(`/jobs/${jobId}?limit=${limit}`);
    return res.data.candidateList.items;
  } catch (err) {
    console.error("Error in fetchTopCandidates:", err.response?.data || err.message);
    throw err;
  }
}
