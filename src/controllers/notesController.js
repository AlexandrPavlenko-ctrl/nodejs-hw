import { Note } from '../models/note.js';
import createError from 'http-errors';

export const getAllNotes = async (req, res, next) => {
  try {
    const { page, perPage, tag, search } = req.query;
    const skip = (page - 1) * perPage;

    const filter = {};

    if (tag) {
      filter.tags = tag;
    }

    if (search) {
      // Текстовий пошук за регулярним виразом ($regex) регистронезалежно ('i')
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const notes = await Note.find(filter).skip(skip).limit(perPage);
    const totalNotes = await Note.countDocuments(filter);
    const totalPages = Math.ceil(totalNotes / perPage);

    res.status(200).json({
      page,
      perPage,
      totalNotes,
      totalPages,
      notes
    });
  } catch (error) {
    next(error);
  }
};

export const getNoteById = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findById(noteId);

    if (!note) {
      return next(createError(404, `Нотатку з ID ${noteId} не знайдено`));
    }

    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};

export const createNote = async (req, res, next) => {
  try {
    const result = await Note.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const result = await Note.findByIdAndUpdate(noteId, req.body, { new: true, runValidators: true });

    if (!result) {
      return next(createError(404, `Нотатку з ID ${noteId} не знайдено`));
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const result = await Note.findByIdAndDelete(noteId);

    if (!result) {
      return next(createError(404, `Нотатку з ID ${noteId} не знайдено`));
    }

    res.status(200).json({ message: 'Нотатку успішно видалено' });
  } catch (error) {
    next(error);
  }
};
