import { Joi } from 'celebrate';
import mongoose from 'mongoose';
import { TAGS } from '../constants/tags.js';

// функція валідації для Mongoose ObjectId
const isValidObjectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message('Невалідний ідентифікатор нотатки (noteId)');
  }
  return value;
};

// 1. Строга валідація параметрів запиту
export const getAllNotesSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(5).max(20).default(10),
    // tag: має бути або одним із дійсних тегів, або взагалі відсутнім (без порожніх рядків та null)
    tag: Joi.string().valid(...TAGS).optional(),
    // search: має бути рядком, допустимо передавати порожній рядок "" (без null)
    search: Joi.string().allow('').optional(),
  }),
};

// 2. Схема валідації ідентифікатора
export const noteIdSchema = {
  params: Joi.object({
    noteId: Joi.string().custom(isValidObjectId).required(),
  }),
};

// 3. Схема валідації для створення
export const createNoteSchema = {
  body: Joi.object({
    title: Joi.string().min(1).required().messages({
      'any.required': 'Поле "title" є обовʼязковим',
    }),
    content: Joi.string().allow('').optional(),
    tag: Joi.string().valid(...TAGS).optional(),
  }),
};

// 4. Схема валідації для оновлення
export const updateNoteSchema = {
  params: noteIdSchema.params,
  body: Joi.object({
    title: Joi.string().min(1).optional(),
    content: Joi.string().allow('').optional(),
    tag: Joi.string().valid(...TAGS).optional(),
  })
    .min(1)
    .messages({
      'object.min': 'Тіло запиту не може бути порожнім. Надішліть хоча б одне поле для оновлення: title, content або tag',
    }),
};
