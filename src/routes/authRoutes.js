import { Router } from 'express'; // 1. ПРАВИЛЬНО: Імпортуємо безпосередньо Router
import { celebrate } from 'celebrate';
import * as authController from '../controllers/authController.js';
import { registerUserSchema, loginUserSchema } from '../validations/authValidation.js';

// 2. Створюємо роутер за допомогою імпортованого Router()
const router = Router();

// Маршрут реєстрації нового користувача
router.post(
  '/auth/register',
  celebrate(registerUserSchema),
  authController.registerUser
);

// Маршрут логіну зареєстрованого користувача
router.post(
  '/auth/login',
  celebrate(loginUserSchema),
  authController.loginUser
);

// Маршрут оновлення сесії користувача
router.post(
  '/auth/refresh',
  authController.refreshUserSession
);

// Маршрут виходу користувача із системи
router.post(
  '/auth/logout',
  authController.logoutUser
);

export default router;
