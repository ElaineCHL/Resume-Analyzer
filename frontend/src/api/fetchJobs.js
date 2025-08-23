import api from '../lib/axios.js';

export async function fetchJobs() {
  try {
    const res = await api.get(`/jobs`);
    return res.data;
  } catch (err) {
    console.error("Error fetching jobs:", err.response?.data || err.message);
    throw err; // bubble up so frontend sees 500 properly
  }
}
