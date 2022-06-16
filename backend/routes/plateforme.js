const express = require('express');

const plateformeController = require('../controllers/plateforme');

const router = express.Router();

router.get('/all', plateformeController.getAllPlateforme);

router.post('/add', plateformeController.postPlateforme);

router.put('/save', plateformeController.putPlateforme);

router.delete('/delete/:id', plateformeController.deletePlateforme);

router.get('/fiche/:id', plateformeController.consulterPlateforme);

module.exports = router;
