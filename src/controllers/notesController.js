import { Note } from '../models/note.js';
import createError from 'http-errors';

export const getAllNotes = async (req, res, next) => {
  try {
    const { page, perPage, tag, search } = req.query;
    const skip = (page - 1) * perPage;

    // Ініціалізуємо базові Mongoose-запити для чейнінгу
    const notesQuery = Note.find();
    const countQuery = Note.countDocuments();

    // Застосовуємо чейнінг методів для фільтрації за тегом
    if (tag) {
      notesQuery.where('tag').equals(tag);
      countQuery.where('tag').equals(tag);
    }

    // Застосовуємо чейнінг методів для текстового пошуку через $regex
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

    // Додаємо пагінацію до запиту списку
    notesQuery.skip(skip).limit(perPage);

    // Одночасне виконання запитів нотаток та лічильника через Promise.all
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

    // Використовуємо опцію returnDocument: 'after'
    const result = await Note.findByIdAndUpdate(
      noteId,
      req.body,
      { returnDocument: 'after', runValidators: true }
    );

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

    // Повертаємо об'єкт видаленої нотатки
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
