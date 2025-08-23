import api from '../lib/axios.js';

export async function fetchCandidates(jobId) {
  try {
    const res = await api.get(`/jobs/${jobId}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching candidates:", err.response?.data || err.message);
    throw err; // bubble up so frontend sees 500 properly
  }
}
