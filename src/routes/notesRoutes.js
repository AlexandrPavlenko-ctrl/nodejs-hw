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

router.get('/notes', celebrate(getAllNotesSchema), notesController.getAllNotes);
router.get('/notes/:noteId', celebrate(noteIdSchema), notesController.getNoteById);
router.post('/notes', celebrate(createNoteSchema), notesController.createNote);
router.patch('/notes/:noteId', celebrate(updateNoteSchema), notesController.updateNote);
router.delete('/notes/:noteId', celebrate(noteIdSchema), notesController.deleteNote);

export default router;
