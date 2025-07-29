import React, { useState, useCallback } from 'react';
import Util from '../lib/utils.js';
import api from '../lib/axios.js';

// allow pdf and word
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const BatchResumeUploader = () => {
  const [resumes, setResumes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({});
  const [error, setError] = useState("");

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
    if (resumes.length === 0) return;
    setUploading(true);
    const newStatus = {};

    for (const file of resumes) {
      const { name, type } = file;
      const fileKey = name;

      try {
        // Get pre-signed URL
        const { data } = await api.get('/get-presigned-url', {
          params: {
            filename: name,
            fileType: type
          },
        });

        if (!data.url) { throw new Error('Failed to get pre-signed URL'); }

        // Upload file to S3
        const res = await fetch(data.url, {
          method: 'PUT',
          headers: { 'Content-Type': encodeURI(type) },
          body: file,
        });

        if (!res.ok) { throw new Error(`Upload failed with status ${res.status}`); }
        newStatus[fileKey] = 'Uploaded';
      } catch (err) {
        let errorMsg = 'An unknown error occurred.';

        if (err.response) {
          errorMsg = err.response.data?.message || `Server error: ${err.response.status}`;
        } else if (err.request) {
          errorMsg = 'No response from server. Check your network connection.';
        } else {
          errorMsg = err.message;
        }
        setError(errorMsg);
        newStatus[fileKey] = 'Failed';
      }
    }
    setError("");
    setUploadStatus(prev => ({ ...prev, ...newStatus }));
    setUploading(false);
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

  const uploadedCount = Object.values(uploadStatus).filter(status => status === 'Uploaded').length;
  const failedCount = Object.values(uploadStatus).filter(status => status === 'Failed').length;
  const processedCount = Object.keys(uploadStatus).length;

  return (
    <>
      <div className="container my-5">
        {!Util.isEmptyString(error) && (
          <div className="alert alert-danger mt-2" role="alert">
            {error}
          </div>
        )}
        <h3 className="mb-4">Batch Resume Uploader</h3>
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

            <div className="d-flex gap-2 align-items-center mb-3">
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
              {uploading && (
                <small className="text-muted">
                  Processing files...
                </small>
              )}
            </div>

            {/* Summary */}
            {processedCount > 0 && (
              <div className="alert alert-info mb-0">
                {uploadedCount > 0 && (
                  <span>{uploadedCount} uploaded successfully</span>
                )}
                {failedCount > 0 && (
                  <span className="text-danger ms-2">
                    {failedCount} failed
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default BatchResumeUploader;