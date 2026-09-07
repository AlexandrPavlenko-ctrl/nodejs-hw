import { Schema, model } from 'mongoose';
import { TAGS } from '../constants/tags.js';

const noteSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: false,
      trim: true,
      default: '' // Додано значення за замовчуванням — порожній рядок
    },
    tag: {
      type: String,
      enum: TAGS,
      default: 'Todo'
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Виправлено назву моделі на 'User' (з великої літери)
      required: true
    }
  },
  { versionKey: false, timestamps: true }
);

// Створюємо звичайний індекс на обидва поля — tag та userId, як вимагає ментор
noteSchema.index({ tag: 1, userId: 1 });

export const Note = model('Note', noteSchema); // Виправлено назву моделі у першому аргументі на 'Note'
