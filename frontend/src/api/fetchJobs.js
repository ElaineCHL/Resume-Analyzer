import { apiGateway } from '../lib/axios.js';

export async function fetchAllJobs() {
  try {
    const res = await apiGateway.get(`/jobs`);
    return res.data.jobs.items;
  } catch (err) {
    console.error("Error fetching jobs:", err.response?.data || err.message);
    throw err;
  }
}
