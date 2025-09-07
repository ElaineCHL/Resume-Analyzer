import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import { fetchJobWithCandidates } from "../api/fetchCandidates.js";

const JobDetailsPage = () => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resumeSummary, setResumeSummary] = useState("");
  const [showModal, setShowModal] = useState(false);

  const { jobId } = useParams();
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchJobWithCandidates(jobId);
        setJob(data);
      } catch (err) {
        console.error("Failed to fetch rankings:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [jobId]);

  const handleViewSummary = async (summary) => {
    try {
      setShowModal(true);
      setResumeSummary(summary);
    } catch (err) {
      console.error("Failed to fetch resume summary:", err);
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
  const { jobTitle, jobDescription, jobSkills } = job.job;

  return (
    <div className="container mt-5">
      <div className="card shadow-sm">
        <div className="card-body">
          <h3 className="card-title text-center">{jobTitle}</h3>
          <p className="text-muted">Job ID: {jobId}</p>
          <div className="p-3 my-3 bg-light border-start border-primary border-4 rounded">
            <div style={{ whiteSpace: "pre-wrap" }}>
              {jobDescription}
            </div>
          </div>
          <div className="mb-0">
            Required Skills: {jobSkills.map((skill, idx) => (
              <span key={idx} className="badge bg-primary me-1">
                {skill}
              </span>
            ))}
          </div>

          <table className="table table-hover mt-3">
            <thead className="table-light">
              <tr>
                <th scope="col">#</th>
                <th scope="col">Candidate Name</th>
                <th scope="col">Email</th>
                <th scope="col">Score</th>
                <th scope="col">Matched Criteria</th>
                <th scope="col">Summary</th>
                <th scope="col">Resume</th>
              </tr>
            </thead>
            <tbody>
              {job.candidateList.items.map((c, idx) => {
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
                    <td>
                      <button
                        className="btn btn-sm btn-outline-info"
                        onClick={() => handleViewSummary(c.summary)}
                      >
                        View Summary
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          if (!c.resumePath) {
                            console.error("No filename found for candidate:", c);
                            return;
                          }

                          const encodedKey = c.resumePath.split("/").map(encodeURIComponent).join("/");
                          const url = `${import.meta.env.VITE_RESUME_S3_BASE_URL}/${encodedKey}`;
                          window.open(url, "_blank");
                        }}                      >
                        View Resume
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
        <Modal show={showModal} onHide={() => setShowModal(false)} centered size="xl">
          <Modal.Header closeButton>
            <Modal.Title>Resume Summary</Modal.Title>
          </Modal.Header>
          <Modal.Body className="overflow-auto">
            <div
              style={{
                maxHeight: "400px",
                whiteSpace: "pre-wrap"
              }}
            >
              {resumeSummary}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default JobDetailsPage;