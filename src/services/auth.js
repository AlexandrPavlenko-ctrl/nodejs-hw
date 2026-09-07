import crypto from 'node:crypto'; // 1. Використовуємо вбудований захищений модуль Node.js
import { Session } from '../models/session.js';
import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/time.js';

/**
 * Створює випадкові захищені access та refresh токени за допомогою crypto,
 * записує нову сесію в базу даних і повертає її
 * @param {String} userId - Ідентифікатор користувача з бази даних
 * @returns {Object} - Створений документ сесії
 */
export const createSession = async (userId) => {
  const accessTokenValidUntil = new Date(Date.now() + FIFTEEN_MINUTES);
  const refreshTokenValidUntil = new Date(Date.now() + ONE_DAY);

  // 2. ГЕНЕРУЄМО випадкові захищені токени довжиною 30 байт у форматі base64 замість JWT
  const accessToken = crypto.randomBytes(30).toString('base64');
  const refreshToken = crypto.randomBytes(30).toString('base64');

  // Зберігаємо сесію у колекції MongoDB
  const session = await Session.create({
    userId,
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });

  return session;
};


export const setSessionCookies = (res, session) => {
  const baseCookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  };

  res.cookie('accessToken', session.accessToken, {
    ...baseCookieOptions,
    maxAge: FIFTEEN_MINUTES,
  });

  res.cookie('refreshToken', session.refreshToken, {
    ...baseCookieOptions,
    maxAge: ONE_DAY,
  });

  res.cookie('sessionId', session._id.toString(), {
    ...baseCookieOptions,
    maxAge: ONE_DAY,
  });
};
