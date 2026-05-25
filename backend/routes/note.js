const express = require('express');
const noteController = require('../controllers/note');
const authMiddleware = require('../auth/authMiddleware');

const router = express.Router();

router.get('/all/:id', authMiddleware, noteController.getAllNote);
router.post('/add', authMiddleware, noteController.postNote);
router.put('/save', authMiddleware, noteController.putNote);
router.delete('/delete/:id', authMiddleware, noteController.deleteNote);
router.get('/fiche/:id', authMiddleware, noteController.consulterNote);

module.exports = router;
