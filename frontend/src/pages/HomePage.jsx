import { useState } from "react";
import BatchResumeUploader from "../components/BatchResumeUploader.jsx";
import JobDescriptionForm from "../components/JobDescriptionForm.jsx";

const HomePage = () => {
  const [jobId, setJobId] = useState(null);

  return (
    <div className="container mt-4 min-vh-100">
      <div className="row">
        <div className="col-md-6 mb-5">
          <div className="card shadow-sm">
            <div className="card-body">
              {/* Pass setter to JobDescriptionForm */}
              <JobDescriptionForm onJobCreated={setJobId} />
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-5">
          <div className="card shadow-sm">
            <div className="card-body">
              {/* Pass jobId to BatchResumeUploader */}
              <BatchResumeUploader jobId={jobId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage;
