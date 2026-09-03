import { Joi } from 'celebrate';
import mongoose from 'mongoose';
import { TAGS } from '../constants/tags.js';

// Кастомна функція валідації для Mongoose ObjectId
const isValidObjectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message('Невалідний ідентифікатор нотатки (noteId)');
  }
  return value;
};

// GET /notes
export const getAllNotesSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(5).max(20).default(10),
    tag: Joi.string().valid(...TAGS).optional().allow('', null),
    search: Joi.string().allow('', null),
  }),
};

// GET /notes/:noteId та DELETE /notes/:noteId
export const noteIdSchema = {
  params: Joi.object({
    noteId: Joi.string().custom(isValidObjectId).required(),
  }),
};

// POST /notes
export const createNoteSchema = {
  body: Joi.object({
    title: Joi.string().min(1).required().messages({
      'any.required': 'Поле "title" є обовʼязковим',
      'string.min': 'Заголовок повинен містити мінімум 1 символ',
    }),
    content: Joi.string().allow('').optional(),
    tag: Joi.string().valid(...TAGS).optional(),
  }),
};

// PATCH /notes/:noteId
export const updateNoteSchema = {
  params: Joi.object({
    noteId: Joi.string().custom(isValidObjectId).required(),
  }),
  body: Joi.object({
    title: Joi.string().min(1).optional(),
    content: Joi.string().allow('').optional(),
    tag: Joi.string().valid(...TAGS).optional(),
  })
    .min(1) // Перевірка, що тіло запиту не порожнє
    .messages({
      'object.min': 'Тіло запиту не може бути порожнім. Надішліть хоча б одне поле для оновлення: title, content або tag',
    }),
};
