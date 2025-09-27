const AWS = require('aws-sdk');

// Configure Cloudflare R2 (S3-compatible)
const r2 = new AWS.S3({
  endpoint: process.env.R2_ENDPOINT,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  region: 'auto',
  signatureVersion: 'v4',
});

const uploadToR2 = async (file, key) => {
  try {
    const params = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    const result = await r2.upload(params).promise();
    return result.Location;
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('File upload failed');
  }
};

const deleteFromR2 = async (key) => {
  try {
    const params = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key
    };

    await r2.deleteObject(params).promise();
    return true;
  } catch (error) {
    console.error('Delete error:', error);
    throw new Error('File deletion failed');
  }
};

const generateSignedUrl = (key, expiresIn = 3600) => {
  try {
    const params = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Expires: expiresIn
    };

    return r2.getSignedUrl('getObject', params);
  } catch (error) {
    console.error('Signed URL error:', error);
    throw new Error('Failed to generate signed URL');
  }
};

module.exports = {
  uploadToR2,
  deleteFromR2,
  generateSignedUrl
};