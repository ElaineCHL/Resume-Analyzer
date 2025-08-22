const AboutPage = () => {
  return (
    <div className="container mt-4 min-vh-100">
      <h2 className="mb-4 text-center">About This Project</h2>

      <div className="mb-4">
        <h5>🎯 Project Overview</h5>
        <p>
          This project was developed for the Distributed Computer Systems (DCS) course to demonstrate the use of cloud-based infrastructure, particularly leveraging services provided by Amazon Web Services (AWS).
          The application is a prototype recruitment tool that allows users to:
        </p>
        <ul>
          <li>Post job openings with detailed descriptions</li>
          <li>Upload and manage a batch of resumes for automated processing</li>
        </ul>
      </div>

      <div className="mb-4">
        <h5>🖥️ Frontend Features</h5>
        <ul>
          <li>Minimalist design using Bootstrap 5</li>
          <li>Job description form for entering open positions</li>
          <li>Resume uploader component for batch resume handling</li>
          <li>
            Responsive layout using Bootstrap grid to display components
            side-by-side on larger screens
          </li>
        </ul>
      </div>

      <div className="mb-4">
        <h5>🔧 Tech Stack</h5>
        <ul>
          <li>React (Frontend)</li>
          <li>Bootstrap for styling and layout</li>
          <li>AWS (Lambda, S3, IAM, Textract, CloudWatch)</li>
        </ul>
      </div>

      <div>
        <h5>🚀 Future Scope</h5>
        <ul>
          <li>Integrate AI-based resume filtering and ranking</li>
          <li>Save job posts and resumes to backend or cloud</li>
          <li>Support exporting filtered results (PDF/CSV)</li>
          <li>User authentication and access control</li>
        </ul>
      </div>
    </div>
  );
};

export default AboutPage;
