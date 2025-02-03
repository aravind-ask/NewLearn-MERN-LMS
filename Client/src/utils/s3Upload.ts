import axios from "axios";

export const uploadToS3 = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post("/user/upload-url", {
      fileName: file.name,
    });
    const { presignedUrl, key } = response.data;

    const uploadResponse = await axios.put(presignedUrl, file, {
      headers: {
        "Content-Type": file.type,
      },
    });

    if (uploadResponse.status === 200) {
      return `https://your-bucket-name.s3.amazonaws.com/${key}`;
    }

    throw new Error("Failed to upload to S3");
  } catch (error) {
    throw new Error("Error uploading file to S3");
  }
};
