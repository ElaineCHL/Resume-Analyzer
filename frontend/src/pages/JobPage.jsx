import { useEffect, useState } from "react";
import { fetchCandidates } from '../api/fetchCandidates.js';

const JobPage = () => {
  const [jobs, setJobs] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        const res = await fetchCandidates("JD12345"); // TODO: make dynamic
        setJobs(res);
      } catch (err) {
        console.error("Failed to load candidates", err);
      } finally {
        setLoading(false);
      }
    };
    loadCandidates();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div>
          <span
            className="spinner-border spinner-border text-primary me-2"
            role="status"
            aria-hidden="true"
          ></span>
          Uploading...
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4 min-vh-100" >
      <h3 className="mb-4">Candidate Rankings for Job</h3>
      <div className="row">
        <div key={jobs.jobID} className="col-md-4 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">{jobs.title}</h5>
              <p className="card-text text-muted">Job ID: {jobs.jobID}</p>

              <h6 className="mt-3 text-secondary">Top 3 Candidates</h6>
              <ul className="list-group list-group-flush">
                {jobs.candidates.slice(0, 3).map((c) => (
                  <li
                    key={c.candidateID}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>{c.name}</strong>
                      <br />
                      <small className="text-muted">{c.email}</small>
                    </div>
                    <span className="badge bg-primary rounded-pill">
                      {c.score}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href={`/job/${jobs.jobID}`}
                className="btn btn-sm btn-outline-primary mt-3 w-100"
              >
                View Full Rankings
              </a>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};

export default JobPage;