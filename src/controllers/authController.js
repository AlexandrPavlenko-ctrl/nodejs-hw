import createHttpError from 'http-errors';
import bcrypt from 'bcrypt'; // 1. Явно імпортуємо bcrypt у контролер
import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import * as authService from '../services/auth.js';

// Спільні параметри для очищення кукі
const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
};

export const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(createHttpError(400, 'Email in use'));
    }

    // 2. Явно хешуємо пароль перед збереженням за допомогою bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Створюємо користувача з уже захешованим паролем
    const user = await User.create({ email, password: hashedPassword });

    const session = await authService.createSession(user._id);
    authService.setSessionCookies(res, session);

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(createHttpError(401, 'Invalid credentials'));
    }

    // 3. Явно використовуємо bcrypt.compare для верифікації пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(createHttpError(401, 'Invalid credentials'));
    }

    await Session.deleteOne({ userId: user._id });

    const session = await authService.createSession(user._id);
    authService.setSessionCookies(res, session);

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const refreshUserSession = async (req, res, next) => {
  try {
    const { sessionId, refreshToken } = req.cookies;

    if (!sessionId || !refreshToken) {
      return next(createHttpError(401, 'Session not found'));
    }

    const session = await Session.findOne({ _id: sessionId, refreshToken });
    if (!session) {
      return next(createHttpError(401, 'Session not found'));
    }

    // Перевіряємо, чи не прострочений refresh-токен
    const isRefreshTokenExpired = new Date() > new Date(session.refreshTokenValidUntil);
    if (isRefreshTokenExpired) {
      // 4. ОБОВ'ЯЗКОВИЙ CLEANUP: видаляємо сесію з бази
      await Session.deleteOne({ _id: sessionId });

      // Очищаємо всі три кукі на клієнті перед поверненням помилки
      res.clearCookie('accessToken', cookieOptions);
      res.clearCookie('refreshToken', cookieOptions);
      res.clearCookie('sessionId', cookieOptions);

      return next(createHttpError(401, 'Session token expired'));
    }

    const userId = session.userId;
    await Session.deleteOne({ _id: sessionId });

    const newSession = await authService.createSession(userId);
    authService.setSessionCookies(res, newSession);

    res.status(200).json({ message: 'Session refreshed' });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    const { sessionId } = req.cookies;

    if (sessionId) {
      await Session.deleteOne({ _id: sessionId });
    }

    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
    res.clearCookie('sessionId', cookieOptions);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
