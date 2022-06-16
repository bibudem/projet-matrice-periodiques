const express = require('express');

const archiveController = require('../controllers/archive');

const router = express.Router();

router.get('/all/:id', archiveController.getAllArchive);

router.post('/add', archiveController.postArchive);

router.put('/save', archiveController.putArchive);

router.delete('/delete/:id', archiveController.deleteArchive);

router.get('/fiche/:id', archiveController.consulterArchive);

module.exports = router;
