import { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import { fetchTopCandidates } from '../api/fetchCandidates.js';
import { fetchAllJobs } from '../api/fetchJobs.js';

const JobPage = () => {
  const [jobs, setJobs] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        const jobsList = await fetchAllJobs();
        const jobsWithCandidates = [];

        for (const job of jobsList) {
          const candidates = await fetchTopCandidates(job.jobID, 3);
          jobsWithCandidates.push({ ...job, candidates });
        }
        setJobs(jobsWithCandidates);
      } catch (err) {
        toast.error("Failed to load candidates", err);
        setJobs([]);
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

  if (!jobs || jobs.length === 0) {
    return (
      <div className="container min-vh-100 d-flex flex-column justify-content-center align-items-center">
        <h4>No jobs available.</h4>
        <p className="text-secondary">Please <a href="/">create a job</a> to view candidate rankings.</p>
      </div>
    );
  }

  return (
    <div className="container mt-4 min-vh-100">
      <h3 className="mb-4">Candidate Rankings for Jobs</h3>
      <div className="row">

        {/* Job */}
        {jobs.map((job) => (
          <div key={job.jobID} className="col-md-4 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-header">
                <h5 className="leadcard-title">{job.jobTitle}</h5>
                <p className="small card-text text-muted">Job ID: {job.jobID}</p>
              </div>
              <div className="card-body">
                <h6 className="leadtext-secondary">Top 3 Candidates</h6>
                <ul className="list-group list-group-flush">

                  {/* Top 3 Candidates */}
                  {job.candidates
                    ?.filter((c) => c.SK.startsWith("CANDIDATE#"))
                    .slice(0, 3)
                    .map((c) => (
                      <li key={c.SK.split("#")[1]} className="list-group-item d-flex justify-content-between align-items-center">
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
                <a href={`/job/${job.jobID}`} className="btn btn-sm btn-outline-primary mt-3 w-100">
                  View Full Rankings
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobPage;