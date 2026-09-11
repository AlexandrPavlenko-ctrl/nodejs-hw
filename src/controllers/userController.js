import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';

export const updateUserAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(createHttpError(400, 'No file'));
    }

    // Завантажуємо буфер з пам'яті через стрим
    const cloudinaryResult = await saveFileToCloudinary(req.file.buffer, req.user._id);

    await User.findByIdAndUpdate(
      req.user._id,
      { avatar: cloudinaryResult.secure_url },
      { returnDocument: 'after'}
    );

    res.status(200).json({
      url: cloudinaryResult.secure_url,
    });
  } catch (error) {
    next(error);
  }
};
