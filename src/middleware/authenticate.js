import createHttpError from 'http-errors';
import { Session } from '../models/session.js';
import { User } from '../models/user.js';

export const authenticate = async (req, res, next) => {
  try {
    const { accessToken, sessionId } = req.cookies;

    // 1. Перевіряємо наявність ОБОХ кукі: і accessToken, і sessionId
    if (!accessToken || !sessionId) {
      return next(createHttpError(401, 'Missing access token or session ID'));
    }

    // 2. Шукаємо у базі даних сесію за ОБОМА обліковими даними (_id має збігатися з sessionId)
    const session = await Session.findOne({ _id: sessionId, accessToken });
    if (!session) {
      return next(createHttpError(401, 'Session not found'));
    }

    // 3. Перевіряємо, чи не прострочений access-токен
    const isAccessTokenExpired = new Date() > new Date(session.accessTokenValidUntil);
    if (isAccessTokenExpired) {
      return next(createHttpError(401, 'Access token expired'));
    }

    // 4. Шукаємо користувача, пов’язаного з цією сесією
    const user = await User.findById(session.userId);
    if (!user) {
      return next(createHttpError(401)); // Повертає 401 без повідомлення
    }

    // 5. У разі успіху додаємо об’єкт знайденого користувача в req.user і викликаем next()
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
