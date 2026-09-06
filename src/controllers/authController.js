import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import * as authService from '../services/auth.js';

export const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(createHttpError(400, 'Email in use'));
    }

    const user = await User.create({ email, password });
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
    if (!user || !(await user.comparePassword(password))) {
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

    const isRefreshTokenExpired = new Date() > new Date(session.refreshTokenValidUntil);
    if (isRefreshTokenExpired) {
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

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    };

    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
    res.clearCookie('sessionId', cookieOptions);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
