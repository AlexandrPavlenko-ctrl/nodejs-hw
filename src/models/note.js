import { Schema, model } from 'mongoose';
import { TAGS } from '../constants/tags.js';

const noteSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: false, trim: true },
    tag: { type: String, enum: TAGS, default: 'Todo' },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

noteSchema.index({ tag: 1 });

export const Note = model('note', noteSchema);
