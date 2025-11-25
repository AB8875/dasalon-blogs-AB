// src/lib/cloudinary-compat.ts
// Cloudinary-compatible S3 uploader for NestJS backend and Node.js environments.
// Mirrors the Cloudinary v2.uploader API but stores files in AWS S3.
// Usage:
//   import { cloudinary } from './cloudinary-compat';
//   const result = await cloudinary.uploader.upload(buffer, { folder: 'posts' });
//   console.log(result.secure_url, result.public_id);

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import * as fs from "fs";
import * as path from "path";
import { lookup as mimeLookup } from "mime-types";

const REGION = process.env.AWS_REGION || "ap-south-1";
const BUCKET = process.env.S3_BUCKET || process.env.AWS_S3_BUCKET || "";

if (!BUCKET) {
  console.warn(
    "[cloudinary-compat] Warning: S3 bucket is not set (S3_BUCKET or AWS_S3_BUCKET env var required)."
  );
}

const s3 = new S3Client({ region: REGION });

// Cloudinary-compatible response interface
export interface CloudinaryCompatResponse {
  public_id: string;
  url: string;
  secure_url: string;
  bytes: number;
  format: string;
  [key: string]: any;
}

// Upload options interface
export interface UploadOptions {
  folder?: string;
  filename?: string;
  contentType?: string;
  acl?: "public-read" | "private";
  [key: string]: any;
}

/**
 * Upload a file to AWS S3 with Cloudinary-compatible response.
 * Accepts local file path (string) or Buffer.
 * Returns { secure_url, public_id, bytes, format, ... }
 */
export async function upload(
  fileOrPathOrBuffer: string | Buffer,
  options: UploadOptions = {}
): Promise<CloudinaryCompatResponse> {
  let Body: Buffer;
  let contentType = "application/octet-stream";
  let originalFilename = `file-${Date.now()}`;

  if (Buffer.isBuffer(fileOrPathOrBuffer)) {
    Body = fileOrPathOrBuffer;
    contentType = options.contentType || contentType;
    originalFilename = options.filename || originalFilename;
  } else if (typeof fileOrPathOrBuffer === "string") {
    // Remote URLs not supported; must be local file path
    if (
      fileOrPathOrBuffer.startsWith("http://") ||
      fileOrPathOrBuffer.startsWith("https://")
    ) {
      throw new Error(
        "cloudinary-compat: remote URL uploads are not supported. Provide a local file path or Buffer."
      );
    }

    if (!fs.existsSync(fileOrPathOrBuffer)) {
      throw new Error(
        `cloudinary-compat: file not found at ${fileOrPathOrBuffer}`
      );
    }

    Body = fs.readFileSync(fileOrPathOrBuffer);
    contentType = mimeLookup(fileOrPathOrBuffer) || contentType;
    originalFilename = path.basename(fileOrPathOrBuffer);
  } else {
    throw new Error(
      "cloudinary-compat.upload: unsupported file input. Provide local path (string) or Buffer."
    );
  }

  // Generate S3 key with optional folder prefix
  const folderPrefix = options.folder
    ? `${options.folder.replace(/^\//, "")}/`
    : "";
  const extension = path.extname(originalFilename);
  const filenameWithoutExt = path.basename(originalFilename, extension);
  const key = `${folderPrefix}${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}-${filenameWithoutExt}${extension}`;

  // Upload to S3
  const putCommand = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body,
    ContentType: contentType,
    ACL: options.acl || "public-read",
  });

  await s3.send(putCommand);

  // Build S3 URL (standard format: https://bucket.s3.region.amazonaws.com/key)
  const url = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${encodeURIComponent(
    key
  )}`;

  return {
    public_id: key, // S3 object key
    url,
    secure_url: url, // HTTPS is default for S3
    bytes: Body.length,
    format: extension.replace(/^\./, "") || "unknown",
  };
}

/**
 * Delete a file from S3 using its public_id (S3 key).
 * Returns { result: 'ok' } on success.
 */
export async function destroy(public_id: string): Promise<{ result: string }> {
  if (!public_id) {
    throw new Error(
      "cloudinary-compat.destroy: public_id (S3 key) is required."
    );
  }

  const deleteCommand = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: public_id,
  });

  await s3.send(deleteCommand);
  return { result: "ok" };
}

// Export as Cloudinary-compatible v2 API shape
export const cloudinary = {
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

export default cloudinary;
