import { Joi } from 'celebrate';

// 1. Схема валідації для реєстрації
export const registerUserSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  }),
};

// 2. Схема валідації для логіну
export const loginUserSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

// 3. Схема валідації для запиту посилання на відновлення пароля
export const requestResetEmailSchema = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      'any.required': 'Поле "email" є обовʼязковим',
      'string.email': 'Введіть коректну адресу електронної пошти',
    }),
  }),
};

// 4. Схема валідації для встановлення нового пароля
export const resetPasswordSchema = {
  body: Joi.object({
    password: Joi.string().min(8).required().messages({
      'any.required': 'Поле "password" є обовʼязковим',
      'string.min': 'Пароль має містити щонайменше 8 символів',
    }),
    token: Joi.string().required().messages({
      'any.required': 'Поле "token" є обовʼязковим',
    }),
  }),
};
