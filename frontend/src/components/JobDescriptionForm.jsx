import { useState } from "react";
import toast from "react-hot-toast";
import api from "../lib/axios.js";

const JobDescriptionForm = ({ onJobCreated }) => {
  const [jobTitle, setJobTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post("/jobs", { jobTitle, description, skills });
      const jobId = res.data.jobID;
      onJobCreated(jobId);
      setJobTitle("");
      setDescription("");
      setSkills([]);
      toast.success(
        <div>
          Job <strong>{jobTitle}</strong> created successfully!
        </div>
      );
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
        {/* Job Title */}
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

        {/* Job Description */}
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

        {/* Skills */}
        <div className="mb-3">
          <label className="form-label">Required Skills</label>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="e.g., SQL, JavaScript, React,..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
            />
            <button
              className="btn btn-outline-secondary"
              onClick={handleAddSkill}
              type="button"
            >
              Add
            </button>
          </div>
          <div className="mt-2">
            {skills.map((skill, idx) => (
              <span key={idx} className="badge bg-secondary me-2">
                {skill}
                <button
                  type="button"
                  className="btn-close btn-close-white btn-sm ms-2"
                  aria-label="Remove"
                  onClick={() => handleRemoveSkill(skill)}
                  style={{ fontSize: "0.6rem" }}
                ></button>
              </span>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
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
