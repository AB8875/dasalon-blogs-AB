// lib/cloudinary-compat.js
// Minimal Cloudinary-compatible uploader that stores files in AWS S3.
// Usage:
// const cloudinary = require('./lib/cloudinary-compat').v2;
// await cloudinary.uploader.upload('/path/to/file.jpg', { folder: 'posts' });

const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");

const REGION = process.env.AWS_REGION || "ap-south-1";
const BUCKET = process.env.S3_BUCKET || process.env.AWS_S3_BUCKET || "";
if (!BUCKET) {
  console.warn(
    "[cloudinary-compat] Warning: S3 bucket is not set (S3_BUCKET or AWS_S3_BUCKET)."
  );
}
const s3 = new S3Client({ region: REGION });

// Accepts either local file path (string) or Buffer. Returns Cloudinary-like object.
async function upload(fileOrPathOrBuffer, options = {}) {
  let Body;
  let contentType = "application/octet-stream";
  let originalFilename = `file-${Date.now()}`;

  if (Buffer.isBuffer(fileOrPathOrBuffer)) {
    Body = fileOrPathOrBuffer;
    contentType = options.contentType || contentType;
    originalFilename = options.filename || originalFilename;
  } else if (typeof fileOrPathOrBuffer === "string") {
    // treat as a local path or absolute HTTP(s) path (only local path supported here)
    if (
      fileOrPathOrBuffer.startsWith("http://") ||
      fileOrPathOrBuffer.startsWith("https://")
    ) {
      throw new Error(
        "cloudinary-compat: remote URL uploads are not supported by this simple helper. Download first or pass Buffer."
      );
    }
    if (!fs.existsSync(fileOrPathOrBuffer)) {
      throw new Error(
        `cloudinary-compat: file not found ${fileOrPathOrBuffer}`
      );
    }
    Body = fs.readFileSync(fileOrPathOrBuffer);
    contentType = mime.lookup(fileOrPathOrBuffer) || contentType;
    originalFilename = path.basename(fileOrPathOrBuffer);
  } else {
    throw new Error(
      "cloudinary-compat.upload: unsupported file input. Provide local path string or Buffer."
    );
  }

  const folderPrefix = options.folder
    ? `${options.folder.replace(/^\//, "")}/`
    : "";
  const key = `${folderPrefix}${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}-${originalFilename}`;

  const put = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body,
    ContentType: contentType,
    ACL: options.acl || "public-read",
  });

  await s3.send(put);

  const url = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${encodeURIComponent(
    key
  )}`;

  return {
    public_id: key,
    url,
    secure_url: url,
    bytes: Body.length,
    format: path.extname(originalFilename).replace(/^\./, ""),
    // preserve original cloudinary fields if you need more
  };
}

async function destroy(public_id) {
  if (!public_id)
    throw new Error("cloudinary-compat.destroy expects public_id (S3 key).");

  const del = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: public_id,
  });
  await s3.send(del);
  return { result: "ok" };
}

module.exports = {
  v2: {
    uploader: {
      upload,
      destroy,
    },
  },
  uploader: {
    upload,
    destroy,
  },
};
