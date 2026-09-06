import { Joi } from 'celebrate';

export const registerUserSchema = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      'any.required': 'Поле "email" є обовʼязковим',
    }),
    password: Joi.string().min(8).required().messages({
      'any.required': 'Поле "password" є обовʼязковим',
      'string.min': 'Пароль має містити мінімум 8 символів',
    }),
  }),
};

export const loginUserSchema = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      'any.required': 'Поле "email" є обовʼязковим',
    }),
    password: Joi.string().required().messages({
      'any.required': 'Поле "password" є обовʼязковим',
    }),
  }),
};
