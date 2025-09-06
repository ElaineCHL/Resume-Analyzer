import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const generatePresignedUrl = async (req, res) => {
  const { filename, fileType, jobData } = req.query;

  const region = process.env.AWS_REGION;
  const bucket_name = process.env.AWS_S3_BUCKET;
  
  const s3 = new S3Client({ region });

  if (!filename && !fileType) {
    return res.status(400).json({
      success: false,
      error: "Missing filename and fileType"
    });
  } else if (!filename) {
    return res.status(400).json({
      success: false,
      error: "Missing filename"
    });
  } else if (!fileType) {
    return res.status(400).json({
      success: false,
      error: "Missing fileType"
    });
  }

  try {
    const params = {
      Bucket: bucket_name,
      Key: filename,
      ContentType: fileType,
      Metadata: { job_data: jobData }, // metadata keys must be lowercase
    };
    const command = new PutObjectCommand(params);
    const url = await getSignedUrl(s3, command, { expiresIn: 60 });

    return res.json({
      success: true,
      url: url
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to generate presigned URL. " + error
    });
  }
};
