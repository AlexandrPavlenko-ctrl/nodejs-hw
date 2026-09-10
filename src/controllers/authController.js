import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import handlebars from 'handlebars';
import fs from 'node:fs/promises';
import path from 'node:path';
import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import { sendEmail } from '../utils/sendMail.js';
import * as authService from '../services/auth.js';

// Общие настройки безопасности для очистки/удаления куки
const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
};

// =========================================================================
// 1. РЕГИСТРАЦИЯ ПОЛЬЗОВАТЕЛЯ
// =========================================================================
export const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(createHttpError(400, 'Email in use'));
    }

    // Явно хешируем пароль перед передачей в модель (требование ментора)
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ email, password: hashedPassword });

    // Создаем сессию с Opaque-токенами через crypto и записываем куки
    const session = await authService.createSession(user._id);
    authService.setSessionCookies(res, session);

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// 2. ВХОД В СИСТЕМУ (ЛОГИН)
// =========================================================================
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(createHttpError(401, 'Invalid credentials'));
    }

    // Явная проверка пароля через bcrypt.compare
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(createHttpError(401, 'Invalid credentials'));
    }

    // Удаляем предыдущую сессию пользователя, чтобы не плодить мусор в БД
    await Session.deleteOne({ userId: user._id });

    const session = await authService.createSession(user._id);
    authService.setSessionCookies(res, session);

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// 3. ОБНОВЛЕНИЕ СЕССИИ (РЕФРЕШ)
// =========================================================================
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

    const isRefreshTokenExpired = new Date() > new Date(session.refreshTokenValidUntil);
    if (isRefreshTokenExpired) {
      // КРИТИЧЕСКИЙ CLEANUP (требование ментора): удаляем просроченную сессию и чистим куки
      await Session.deleteOne({ _id: sessionId });

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

// =========================================================================
// 4. ВЫХОД ИЗ СИСТЕМЫ (ЛОГАУТ)
// =========================================================================
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

// =========================================================================
// 5. ЗАПРОС ССЫЛКИ НА СБРОС ПАРОЛЯ (ОТПРАВКА EMAIL)
// =========================================================================
export const requestResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Если email не зарегистрирован — возвращаем 200 (задача защиты базы от сканирования)
    if (!user) {
      return res.status(200).json({ message: 'Password reset email sent successfully' });
    }

    // Генерируем JWT-токен, содержащий sub (id) и email на 15 минут
    const resetToken = jwt.sign(
      { sub: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const resetLink = `${process.env.FRONTEND_DOMAIN}/reset-password?token=${resetToken}`;

    // Абсолютный путь от корня проекта (гарантирует чтение файла на Render)
    const templatePath = path.join(process.cwd(), 'src', 'templates', 'reset-password-email.html');

    // Чтение физического файла шаблона, как указано в структуре файлов ТЗ
    const templateSource = await fs.readFile(templatePath, 'utf-8');
    const compileTemplate = handlebars.compile(templateSource);

    const htmlBody = compileTemplate({
      username: user.username || user.email,
      resetLink,
    });

    try {
      // Отправляем письмо через утилиту sendEmail
      await sendEmail({
        to: user.email,
        subject: 'Reset your password',
        html: htmlBody,
      });
    } catch (mailError) {
      console.error('SMTP Error:', mailError); // Выводим ошибку в консоль Render для дебага
      return next(createHttpError(500, 'Failed to send the email, please try again later.'));
    }

    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// 6. ПОДТВЕРЖДЕНИЕ СБРОСА ПАРОЛЯ (ОБНОВЛЕНИЕ В БД)
// =========================================================================
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    let payload;
    try {
      // Верифицируем переданный в Body JWT-токен
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return next(createHttpError(401, 'Invalid or expired token'));
    }

    // Ищем пользователя по соответствию id (sub) и email из токена
    const user = await User.findOne({ _id: payload.sub, email: payload.email });
    if (!user) {
      return next(createHttpError(404, 'User not found'));
    }

    // Хешируем новый пароль перед записью
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};
