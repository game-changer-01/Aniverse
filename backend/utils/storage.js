const AWS = require('aws-sdk');

// Optional Cloudflare R2 (S3-compatible)
const hasR2 = Boolean(
  process.env.R2_ENDPOINT &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_BUCKET_NAME
);

let r2 = null;
if (hasR2) {
  r2 = new AWS.S3({
    endpoint: process.env.R2_ENDPOINT,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    region: 'auto',
    signatureVersion: 'v4',
  });
} else {
  // Log once at startup for visibility in dev
  if (process.env.NODE_ENV !== 'test') {
    console.log('[storage] Cloudflare R2 not configured; storage helpers will be disabled.');
  }
}

const requireR2 = () => {
  if (!hasR2 || !r2) {
    const err = new Error('Cloud storage not configured');
    err.code = 'R2_NOT_CONFIGURED';
    throw err;
  }
};

const uploadToR2 = async (file, key) => {
  requireR2();
  const params = {
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  };
  const result = await r2.upload(params).promise();
  return result.Location;
};

const deleteFromR2 = async (key) => {
  requireR2();
  const params = {
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key
  };
  await r2.deleteObject(params).promise();
  return true;
};

const generateSignedUrl = (key, expiresIn = 3600) => {
  requireR2();
  const params = {
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Expires: expiresIn
  };
  return r2.getSignedUrl('getObject', params);
};

module.exports = { hasR2, uploadToR2, deleteFromR2, generateSignedUrl };