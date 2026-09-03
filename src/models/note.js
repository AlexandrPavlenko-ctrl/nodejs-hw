import { Schema, model } from 'mongoose';
import { TAGS } from '../constants/tags.js';

const noteSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, default: '' }, // Поле може бути порожнім рядком
    favorite: { type: Boolean, default: false },
    tags: {
      type: [String],
      enum: TAGS,
      default: []
    }
  },
  { versionKey: false, timestamps: true }
);

// Створення індексу для властивості tags відповідно до ТЗ
noteSchema.index({ tags: 1 });

export const Note = model('note', noteSchema);
