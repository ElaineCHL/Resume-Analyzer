import { useState } from "react";

const JobDescriptionForm = () => {
  const [jobTitle, setJobTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Job Title:", jobTitle);
    console.log("Description:", description);
    // TODO: add POST request logic
    alert(`Job submitted successfully!\n${jobTitle}\n${description}`);
    setJobTitle("");
    setDescription("");
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

        <button type="submit" className="btn btn-primary w-100">
          Submit
        </button>
      </form>
    </div>
  );
};

export default JobDescriptionForm;
