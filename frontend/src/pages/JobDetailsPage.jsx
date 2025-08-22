import { useEffect, useState } from "react";
import { fetchCandidates } from "../api/fetchCandidates.js";

const JobDetailsPage = ({ jobId = "JD12345" }) => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchCandidates(jobId);
        setJob(data);
      } catch (err) {
        console.error("Failed to fetch rankings:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [jobId]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status" />
        <span className="ms-2">Loading rankings...</span>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container text-center mt-5">
        <h5 className="text-danger">No rankings found for this job.</h5>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="card shadow-sm">
        <div className="card-body">
          <h3 className="card-title">{job.title}</h3>
          <p className="text-muted">Job ID: {job.jobID}</p>

          <h5 className="mt-4">Candidate Rankings</h5>

          <table className="table table-hover mt-3">
            <thead className="table-light">
              <tr>
                <th scope="col">#</th>
                <th scope="col">Candidate Name</th>
                <th scope="col">Email</th>
                <th scope="col">Score</th>
                <th scope="col">Matched Criteria</th>
              </tr>
            </thead>
            <tbody>
              {job.candidates.map((c, idx) => {
                // Parse matchedCriteria if it's a stringified array
                let skills = [];
                try {
                  skills =
                    typeof c.matchedCriteria === "string"
                      ? JSON.parse(c.matchedCriteria)
                      : c.matchedCriteria || [];
                } catch {
                  skills = [];
                }

                return (
                  <tr key={c.email}>
                    <th scope="row">{idx + 1}</th>
                    <td>{c.name}</td>
                    <td>{c.email}</td>
                    <td>
                      <span className="badge bg-primary">{c.score}</span>
                    </td>
                    <td>
                      {skills.length > 0 ? (
                        <div className="d-flex flex-wrap gap-1">
                          {skills.map((skill, i) => (
                            <span key={i} className="badge bg-info text-dark">
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted">N/A</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <a href="/job" className="btn btn-outline-secondary mt-3">
            Back to Jobs
          </a>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;