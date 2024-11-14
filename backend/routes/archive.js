const express = require('express');

const archiveController = require('../controllers/archive');

const authMiddleware = require('../auth/authMiddleware');

const router = express.Router();

router.get('/all/:id', authMiddleware, archiveController.getAllArchive);

router.post('/add', authMiddleware, archiveController.postArchive);

router.put('/save', authMiddleware, archiveController.putArchive);

router.delete('/delete/:id', authMiddleware, archiveController.deleteArchive);

router.get('/fiche/:id', authMiddleware, archiveController.consulterArchive);

module.exports = router;
