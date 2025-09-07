import { useEffect, useState } from "react";
import { Trash } from 'react-bootstrap-icons';
import { Modal, Button } from "react-bootstrap";
import toast from 'react-hot-toast';
import dayjs from "dayjs";

import relativeTime from "dayjs/plugin/relativeTime";
import { fetchTopCandidates } from '../api/fetchCandidates.js';
import { fetchAllJobs } from '../api/fetchJobs.js';
import { deleteJob } from '../api/deleteJob.js';

const JobPage = () => {
  const [jobs, setJobs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  dayjs.extend(relativeTime);

  useEffect(() => {
    loadCandidates();
  }, []);

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

  const handleDelete = async (job) => {
    setSelectedJob(job);
    setShowModal(true);
  }

  const confirmDelete = async () => {
    if (!selectedJob) return;

    try {
      const res = await deleteJob(selectedJob.jobID);
      const deletedJob = res.deletedJob;
      toast.success(<span>Job <b>{deletedJob.jobTitle}</b> deleted successfully.</span>);
      setJobs((prevJobs) => prevJobs.filter((j) => j.jobID !== selectedJob.jobID));
      setShowModal(false);
      setSelectedJob(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete job");
    }
  };

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
    <>
      {showModal && (
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete Job <b>{selectedJob.jobTitle}</b>?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete}>Delete</Button>
          </Modal.Footer>
        </Modal>
      )}
      <div className="container mt-4 min-vh-100">
        <h3 className="mb-4">Candidate Rankings for Jobs</h3>
        <div className="row">

          {/* Job */}
          {jobs.map((job) => (
            <div key={job.jobID} className="col-md-4 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-header">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0">{job.jobTitle}</h5>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(job)}>
                      <Trash size={18} />
                    </button>
                  </div>
                  <div className="d-flex justify-content-between mt-1">
                    <p className="small text-muted mb-0">Job ID: {job.jobID}</p>
                    <p className="small text-muted mb-0">Posted {dayjs(job.createdAt).fromNow()}</p>
                  </div>
                </div>

                <div className="card-body">
                  <h6 className="leadtext-secondary">Top 3 Candidates</h6>
                  <ul className="list-group list-group-flush">
                    {/* Top 3 Candidates */}
                    {job.candidates
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
    </>
  );
};

export default JobPage;