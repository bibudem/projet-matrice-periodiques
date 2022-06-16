const express = require('express');

const periodiqueController = require('../controllers/periodique');

const router = express.Router();

router.get('/all', periodiqueController.getAllPeriodiques);

router.get('/rapport-all/:plateforme', periodiqueController.getAllRapport);

router.post('/add', periodiqueController.postPeriodique);

router.put('/save', periodiqueController.putPeriodique);

router.delete('/delete/:id', periodiqueController.deletePeriodique);

router.get('/fiche/:id', periodiqueController.consulterPeriodique);

router.post('/consulatation2022', periodiqueController.postPeriodiqueConsultation2022 );

module.exports = router;
