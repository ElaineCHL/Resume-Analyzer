import { useState, useCallback } from 'react';
import { Modal, Button } from "react-bootstrap";
import toast from 'react-hot-toast';
import axios from 'axios';
import Util from '../lib/utils.js';
import {
  convertDocToPdf,
  getPresignedUrl,
  uploadToS3
} from '../api/resumeUploader.js';

// allow pdf and word
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const BatchResumeUploader = ({ jobId }) => {
  const [resumes, setResumes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({});
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => ALLOWED_TYPES.includes(file.type));

    if (validFiles.length !== files.length) {
      alert('Some files were ignored because they are not supported (PDF, DOC, DOCX).');
    }

    // Filter out duplicate files based on name
    setResumes((prev) => {
      const existingFiles = new Set(prev.map(file => `${file.name}`));
      const newFiles = validFiles.filter(file =>
        !existingFiles.has(`${file.name}`)
      );
      return [...prev, ...newFiles];
    });
  }, []);

  const handleUpload = async () => {
    if (!jobId) {
      setShowModal(true);
      return;
    }

    if (resumes.length === 0) return;
    setUploading(true);
    const newStatus = {};

    for (const file of resumes) {
      const { name, type } = file;
      const fileKey = name;

      try {
        let uploadDir = 'uploads/';
        let pdfBlob = file;
        let uploadName = uploadDir + name;

        if (type !== 'application/pdf') {
          pdfBlob = await convertDocToPdf(file);
          uploadName = uploadName.replace(/\.(docx?|DOCX?)$/, '.pdf');
        }
        const url = await getPresignedUrl(uploadName, pdfBlob.type, jobId);
        await uploadToS3(url, pdfBlob, pdfBlob.type);

        newStatus[fileKey] = 'Uploaded';
      } catch (err) {
        let errorMsg = 'An unknown error occurred.';

        if (axios.isAxiosError(err)) {
          if (err.code === 'ERR_NETWORK') {
            errorMsg = 'Network error: Please check your internet connection';
          } else if (err.response) {
            errorMsg = err.response.data?.message || err.response.data?.error || errorMsg;
          } else if (err.request) {
            errorMsg = 'No response from server. Please try again later';
          }
        } else if (err instanceof TypeError) {
          errorMsg = 'Invalid data format detected';
        } else {
          errorMsg = err.message || errorMsg;
        }
        newStatus[fileKey] = 'Failed';
        toast.error(errorMsg);
      }
    }
    setUploadStatus(prev => ({ ...prev, ...newStatus }));
    setUploading(false);

    // toast summary
    const uploadedCount = Object.values(newStatus).filter(status => status === 'Uploaded').length;
    const failedCount = Object.values(newStatus).filter(status => status === 'Failed').length;

    if (uploadedCount > 0 && failedCount === 0) {
      toast.success(`${uploadedCount} file${uploadedCount > 1 ? 's' : ''} uploaded successfully.`);
    } else if (failedCount > 0 && uploadedCount === 0) {
      toast.error(`Failed to upload ${failedCount} file${failedCount > 1 ? 's' : ''}.`);
    } else if (failedCount > 0 && uploadedCount > 0) {
      toast(`Uploaded ${uploadedCount} succeeded, ${failedCount} failed.`, { icon: '⚠️' });
    }
  };

  const removeFile = useCallback((fileName) => {
    const fileKey = `${fileName}`;
    setResumes(prev => prev.filter((file) => `${file.name}` !== fileKey));
    setUploadStatus((prev) => {
      const updated = { ...prev };
      delete updated[fileKey];
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setResumes([]);
    setUploadStatus({});
  }, []);

  return (
    <div>
      {showModal && (
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Job Required</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            ⚠️ Please create a job first before uploading resumes.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={() => setShowModal(false)}>
              OK
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      {!Util.isEmptyString(error) && (
        <div className="alert alert-danger mt-2" role="alert">
          {error}
        </div>
      )}
      <h3 className="mb-4">Upload Resumes</h3>
      <div className="mb-3">
        <label htmlFor="fileInput" className="form-label">
          Select Resume Files (PDF, DOC, DOCX)
        </label>
        <input
          id="fileInput"
          type="file"
          className="form-control"
          multiple
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </div>

      {resumes.length > 0 && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Files to Upload ({resumes.length})</h5>
          </div>

          <div className="mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <ul className="list-group">
              {resumes.map((file) => {
                const fileKey = `${file.name}`;
                const status = uploadStatus[fileKey];
                return (
                  <li
                    key={fileKey}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div className="flex-grow-1">
                      <div className="fw-semibold">{file.name}</div>
                      <small className="text-muted">
                        <span
                          className={
                            status === 'Uploaded'
                              ? 'text-success'
                              : status === 'Failed'
                                ? 'text-danger'
                                : 'text-muted'
                          }
                        >
                          {status || 'Pending'}
                          {status === 'Uploaded' && ' ✓'}
                          {status === 'Failed' && ' ✗'}
                        </span>
                      </small>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-danger ms-2"
                      onClick={() => removeFile(file.name)}
                      disabled={uploading}
                    >
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="d-flex gap-2 align-items-center">
            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={uploading || resumes.length === 0}
            >
              {uploading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Uploading...
                </>
              ) : (
                `Upload`
              )}
            </button>
            <button
              className="btn btn-outline-danger"
              onClick={clearAll}
              disabled={uploading}
            >
              Clear All
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BatchResumeUploader;