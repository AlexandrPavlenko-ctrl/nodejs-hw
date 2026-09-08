import multer from 'multer';
import createHttpError from 'http-errors';

// Зберігаємо файл у пам’яті (memoryStorage)
const storage = multer.memoryStorage();

const limits = {
  fileSize: 1024 * 1024 * 2, // Обмеження розміру файлу до 2MB
};

const fileFilter = (req, file, cb) => {
  // Дозволяє тільки файли з mimetype, що починається з image/
  if (!file.mimetype.startsWith('image/')) {
    return cb(createHttpError(400, 'Only images allowed'));
  }
  cb(null, true);
};

export const upload = multer({ storage, limits, fileFilter });
