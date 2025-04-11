import AWS from "aws-sdk";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

export const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Helper function to determine ContentType based on file extension
const getContentType = (fileName: string): string => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return "image/*";
    case "webm":
      return "video/webm";
    case "mp4":
      return "video/mp4";
    default:
      return "application/octet-stream"; // Fallback for unknown types
  }
};

// Generate presigned URL for uploading files (PUT)
export const getPresignedUploadUrl = async (
  fileName: string,
  options: { expires?: number } = {}
): Promise<{ url: string; key: string }> => {
  const key = `uploads/${uuidv4()}-${Date.now()}-${fileName}`;
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
    Expires: options.expires || 60, // Default to 60 seconds, customizable
    ContentType: getContentType(fileName), // Dynamic ContentType
  };

  const url = await s3.getSignedUrlPromise("putObject", params);
  return { url, key };
};

// Generate presigned URL for downloading files (GET)
export const getPresignedDownloadUrl = async (
  key: string,
  options: { expires?: number } = {}
): Promise<string> => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
    Expires: options.expires || 3600, // Default to 1 hour for playback
    ResponseContentType: getContentType(key), // Ensure correct type for playback
  };

  return await s3.getSignedUrlPromise("getObject", params);
};
