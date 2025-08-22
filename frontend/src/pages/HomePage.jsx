import BatchResumeUploader from "../components/BatchResumeUploader.jsx"
import JobDescriptionForm from "../components/JobDescriptionForm.jsx"

const HomePage = () => {
  return (
    <div className="container mt-4 min-vh-100">
      <div className="row">
        <div className="col-md-6 mb-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <JobDescriptionForm />
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <BatchResumeUploader />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage;
