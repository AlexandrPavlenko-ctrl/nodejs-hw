import { Schema, model } from 'mongoose';

const noteSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: '',
      trim: true,
    },
    tag: {
      type: String,
      enum: [
        'Work', 'Personal', 'Meeting', 'Shopping', 'Ideas',
        'Travel', 'Finance', 'Health', 'Important', 'Todo'
      ],
      default: 'Todo',
    },
  },
  {
    timestamps: true, // Автоматически добавляет createdAt и updatedAt
    versionKey: false, // Отключает техническое поле __v
  }
);

export const Note = model('note', noteSchema);
