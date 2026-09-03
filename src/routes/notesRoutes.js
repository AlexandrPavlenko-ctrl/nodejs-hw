import express from 'express';
import { celebrate } from 'celebrate';
import * as notesController from '../controllers/notesController.js';
import {
  getAllNotesSchema,
  noteIdSchema,
  createNoteSchema,
  updateNoteSchema
} from '../validations/notesValidation.js';

const router = express.Router();

router.get('/', celebrate(getAllNotesSchema), notesController.getAllNotes);
router.get('/:noteId', celebrate(noteIdSchema), notesController.getNoteById);
router.post('/', celebrate(createNoteSchema), notesController.createNote);
router.patch('/:noteId', celebrate(updateNoteSchema), notesController.updateNote);
router.delete('/:noteId', celebrate(noteIdSchema), notesController.deleteNote);

export default router;
