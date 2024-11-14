const express = require('express');

const periodiqueController = require('../controllers/periodique');

const authMiddleware = require('../auth/authMiddleware');

const router = express.Router();

router.get('/all', authMiddleware, periodiqueController.getAllPeriodiques);

router.get('/rapport-all/:plateforme', authMiddleware, periodiqueController.getAllRapport);

router.get('/rapport-autres/:plateforme', authMiddleware, periodiqueController.getAutresRapport);

router.post('/add', authMiddleware, periodiqueController.postPeriodique);

router.put('/save', authMiddleware, periodiqueController.putPeriodique);

router.delete('/delete/:id', authMiddleware, periodiqueController.deletePeriodique);

router.get('/fiche/:id', authMiddleware, periodiqueController.consulterPeriodique);

router.post('/consulatation2022', authMiddleware, periodiqueController.postPeriodiqueConsultation2022 );

module.exports = router;
