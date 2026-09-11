import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Завантажує буфер файлу в Cloudinary за допомогою утиліти upload_stream
 */
export const saveFileToCloudinary = (buffer, userId) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'avatars',
        public_id: `user-${userId}-${Date.now()}`,
        resource_type: 'image',
        overwrite: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result); // Повертає даних завантаженого зображення
      }
    );

    uploadStream.end(buffer);
  });
};
