import { useState } from "react";
import toast from 'react-hot-toast';
import api from '../lib/axios.js';

const JobDescriptionForm = ({ onJobCreated }) => {
  const [jobTitle, setJobTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post("/jobs", { jobTitle, description });
      const jobId = res.data.jobID;
      onJobCreated(jobId);
      setJobTitle("");
      setDescription("");
      toast.success(<div>Job <strong>{jobTitle}</strong> created successfully!</div>);
    } catch (err) {
      toast.error("Error creating job: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="mb-4">Post Job Opening</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Job Title</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g., Frontend Developer"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Job Description</label>
          <textarea
            className="form-control"
            placeholder="Job responsibilities, requirements, etc."
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>

        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Submitting...
            </>
          ) : (
            "Submit"
          )}
        </button>
      </form>
    </div>
  );
};

export default JobDescriptionForm;
