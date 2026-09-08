import { Joi } from 'celebrate';

export const registerUserSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  }),
};

export const loginUserSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

// Валідація для запиту на відновлення
export const requestResetEmailSchema = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      'any.required': 'Поле "email" є обовʼязковим',
    }),
  }),
};

// Валідація для самого скидання
export const resetPasswordSchema = {
  body: Joi.object({
    password: Joi.string().required().messages({
      'any.required': 'Поле "password" є обовʼязковим',
    }),
    token: Joi.string().required().messages({
      'any.required': 'Поле "token" є обовʼязковим',
    }),
  }),
};
