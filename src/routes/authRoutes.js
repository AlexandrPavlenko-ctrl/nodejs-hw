import { Router } from 'express';
import { celebrate } from 'celebrate';
import * as authController from '../controllers/authController.js';
import {
  registerUserSchema,
  loginUserSchema,
  requestResetEmailSchema,
  resetPasswordSchema
} from '../validations/authValidation.js';

const router = Router();

router.post('/auth/register', celebrate(registerUserSchema), authController.registerUser);
router.post('/auth/login', celebrate(loginUserSchema), authController.loginUser);
router.post('/auth/refresh', authController.refreshUserSession);
router.post('/auth/logout', authController.logoutUser);

// Роути для скидання пароля
router.post('/auth/request-reset-email', celebrate(requestResetEmailSchema), authController.requestResetEmail);
router.post('/auth/reset-password', celebrate(resetPasswordSchema), authController.resetPassword);

export default router;
