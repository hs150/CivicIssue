import { v2 as cloudinary } from "cloudinary";

function configured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

export async function uploadImage(file) {
  if (!file) return "";

  if (!configured()) {
    return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "civicconnect/issues", resource_type: "image" },
      (error, result) => error ? reject(error) : resolve(result)
    );
    stream.end(file.buffer);
  });

  return result.secure_url;
}
