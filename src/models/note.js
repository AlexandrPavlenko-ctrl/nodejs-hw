import { Schema, model } from 'mongoose';
import { TAGS } from '../constants/tags.js';

const noteSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true // Автоматично видаляє пробіли з початку та кінця рядка
    },
    content: {
      type: String,
      required: false, // Поле є необовʼязковим
      trim: true
    },
    tag: {
      type: String,
      enum: TAGS, // Валідація: значення має бути лише зі списку TAGS
      default: 'Todo' // Значення за замовчуванням 'Todo'
    }
  },
  { versionKey: false, timestamps: true }
);

// Створення індексу для властивості tag
noteSchema.index({ tag: 1 });

export const Note = model('note', noteSchema);
