import { apiGateway, backend } from '../lib/axios.js';

export async function convertDocToPdf(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiGateway.post('/convert-doc-to-pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
    validateStatus: () => true,
  });

  if (response.status >= 400) {
    const text = await response.data.text();
    const errorJson = JSON.parse(text);
    throw new Error(errorJson.message || 'Conversion failed');
  }

  return new Blob([response.data], { type: 'application/pdf' });
}

export async function getPresignedUrl(filename, fileType, jobData) {
  const { data } = await backend.get('/get-presigned-url', {
    params: { filename, fileType, jobData },
  });

  if (!data.url) {
    throw new Error('Failed to get pre-signed URL');
  }

  return data.url;
}

export async function uploadToS3(url, file, fileType) {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': encodeURI(fileType) },
    body: file,
  });

  if (!res.ok) {
    throw new Error(`Upload failed with status ${res.status}`);
  }
}
