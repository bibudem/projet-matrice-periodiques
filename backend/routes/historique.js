const express = require('express');

const historiqueController = require('../controllers/historique');

const router = express.Router();

router.get('/all/:id', historiqueController.getAllHistorique);

router.post('/add', historiqueController.postHistorique);

router.put('/save', historiqueController.putHistorique);

router.delete('/delete/:id', historiqueController.deleteHistorique);

router.get('/fiche/:id', historiqueController.consulterHistorique);

module.exports = router;
