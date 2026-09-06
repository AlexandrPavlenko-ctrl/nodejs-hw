import express from 'express';
import { celebrate } from 'celebrate';
import * as authController from '../controllers/authController.js';
import { registerUserSchema, loginUserSchema } from '../validations/authValidation.js';

const router = express.Router();

router.post('/auth/register', celebrate(registerUserSchema), authController.registerUser);
router.post('/auth/login', celebrate(loginUserSchema), authController.loginUser);
router.post('/auth/refresh', authController.refreshUserSession);
router.post('/auth/logout', authController.logoutUser);

export default router;
