import { Router } from 'express'; // Імпортуємо Router
import { celebrate } from 'celebrate';
import * as notesController from '../controllers/notesController.js';
import { authenticate } from '../middleware/authenticate.js'; // Імпортуємо мідлвар захисту
import {
  getAllNotesSchema,
  noteIdSchema,
  createNoteSchema,
  updateNoteSchema
} from '../validations/notesValidation.js';

const router = Router();

// Явно додаємо authenticate другим аргументом у кожен маршрут перед celebrate
router.get(
  '/notes',
  authenticate,
  celebrate(getAllNotesSchema),
  notesController.getAllNotes
);

router.get(
  '/notes/:noteId',
  authenticate,
  celebrate(noteIdSchema),
  notesController.getNoteById
);

router.post(
  '/notes',
  authenticate,
  celebrate(createNoteSchema),
  notesController.createNote
);

router.patch(
  '/notes/:noteId',
  authenticate,
  celebrate(updateNoteSchema),
  notesController.updateNote
);

router.delete(
  '/notes/:noteId',
  authenticate,
  celebrate(noteIdSchema),
  notesController.deleteNote
);

export default router;
