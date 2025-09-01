import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchCandidates } from "../api/fetchCandidates.js";
import { fetchResumeSummary } from "../api/fetchResumeSummary.js";

const JobDetailsPage = () => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resumeSummary, setResumeSummary] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { jobId } = useParams();

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

  const handleViewSummary = async (bucket, key) => {
    try {
      setResumeSummary("Loading summary...");
      setShowModal(true);
      const summary = await fetchResumeSummary(bucket, key);
      setResumeSummary(summary.data?.summary || "No summary found.");
    } catch (err) {
      console.error("Failed to fetch resume summary:", err);
      setResumeSummary("Failed to load summary.");
    }
  };

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
          <h3 className="card-title text-center">{job.title}</h3>
          <div className="p-3 my-3 bg-light border-start border-primary border-4 rounded">
            <p className="mb-0 text-dark">{job.description}</p>
          </div>
          <p className="text-muted">Job ID: {job.jobID}</p>

          <table className="table table-hover mt-3">
            <thead className="table-light">
              <tr>
                <th scope="col">#</th>
                <th scope="col">Candidate Name</th>
                <th scope="col">Email</th>
                <th scope="col">Score</th>
                <th scope="col">Matched Criteria</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {job.candidates.map((c, idx) => {
                let skills = [];
                try {
                  skills =
                    typeof c.matchedCriteria === "string"
                      ? JSON.parse(c.matchedCriteria)
                      : c.matchedCriteria || [];
                } catch {
                  skills = [];
                }
                
                const pdfKey = c.key.replace("output/", "uploads/").replace(".json", ".pdf");

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
                    <td>
                      <button
                        className="btn btn-sm btn-outline-info"
                        onClick={() => handleViewSummary(c.bucket, pdfKey)}
                      >
                        View Summary
                      </button>
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

      {showModal && (
        <div className="modal show" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Resume Summary</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>{resumeSummary}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetailsPage;