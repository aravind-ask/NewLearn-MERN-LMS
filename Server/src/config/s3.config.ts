import AWS from "aws-sdk";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

export const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export const getPresignedUrl = async (fileName: string) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: `uploads/${uuidv4()}-${Date.now()}-${fileName}`,
    Expires: 60,
    ContentType: "image/*",
  };

  return await s3.getSignedUrlPromise("putObject", params);
};
