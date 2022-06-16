const express = require('express');

const noteController = require('../controllers/note');

const router = express.Router();

router.get('/all/:id', noteController.getAllNote);

router.post('/add', noteController.postNote);

router.put('/save', noteController.putNote);

router.delete('/delete/:id', noteController.deleteNote);

router.get('/fiche/:id', noteController.consulterNote);

module.exports = router;
