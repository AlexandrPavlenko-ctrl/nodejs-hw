import { Note } from '../models/note.js';
import createError from 'http-errors';

export const getAllNotes = async (req, res, next) => {
  try {
    const { page, perPage, tag, search } = req.query;
    const skip = (page - 1) * perPage;

    // Створюємо запити на основі userId поточного користувача
    const notesQuery = Note.find().where('userId').equals(req.user._id);
    const countQuery = Note.countDocuments().where('userId').equals(req.user._id);

    if (tag) {
      notesQuery.where('tag').equals(tag);
      countQuery.where('tag').equals(tag);
    }

    if (search) {
      const searchFilter = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
        ],
      };
      notesQuery.where(searchFilter);
      countQuery.where(searchFilter);
    }

    notesQuery.skip(skip).limit(perPage);

    // Одночасний запуск Promise.all
    const [notes, totalNotes] = await Promise.all([notesQuery, countQuery]);
    const totalPages = Math.ceil(totalNotes / perPage);

    res.status(200).json({
      page,
      perPage,
      totalNotes,
      totalPages,
      notes,
    });
  } catch (error) {
    next(error);
  }
};

export const getNoteById = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findOne({ _id: noteId, userId: req.user._id });

    if (!note) {
      return next(createError(404, 'Note not found'));
    }

    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};

export const createNote = async (req, res, next) => {
  try {
    const result = await Note.create({
      ...req.body,
      userId: req.user._id,
    });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const result = await Note.findOneAndUpdate(
      { _id: noteId, userId: req.user._id },
      req.body,
      { returnDocument: 'after', runValidators: true }
    );

    if (!result) {
      return next(createError(404, 'Note not found'));
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const result = await Note.findOneAndDelete({ _id: noteId, userId: req.user._id });

    if (!result) {
      return next(createError(404, 'Note not found'));
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
