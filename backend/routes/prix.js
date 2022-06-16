const express = require('express');

const prixController = require('../controllers/prix');

const router = express.Router();

router.get('/all/:id', prixController.getAllPrix);

router.post('/add', prixController.postPrix);

router.put('/save', prixController.putPrix);

router.delete('/delete/:id', prixController.deletePrix);

router.get('/fiche/:id', prixController.consulterPrix);

module.exports = router;
