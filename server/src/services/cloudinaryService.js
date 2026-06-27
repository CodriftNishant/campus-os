import { cloudinary } from "../config/cloudinary.js";

export const uploadImageBuffer = (fileBuffer, folder = "campus-events") =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: "image" }, (error, result) => {
      if (error) reject(error);
      else resolve({ url: result.secure_url, publicId: result.public_id });
    });
    stream.end(fileBuffer);
  });

  export const deleteImage = async (publicId) => {
  if (!publicId) return;

  await cloudinary.uploader.destroy(publicId);
};