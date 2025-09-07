import { useState } from "react";
import BatchResumeUploader from "../components/BatchResumeUploader.jsx";
import JobForm from "../components/JobForm.jsx";

const HomePage = () => {
  const [jobData, setJobData] = useState(null);

  return (
    <div className="container mt-4 min-vh-100">
      <div className="row">
        <div className="col-md-6 mb-5">
          <div className="card shadow-sm">
            <div className="card-body">
              {/* Pass setter to JobForm */}
              <JobForm onJobCreated={setJobData} />
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-5">
          <div className="card shadow-sm">
            <div className="card-body">
              {/* Pass jobId to BatchResumeUploader */}
              <BatchResumeUploader jobData={jobData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage;
