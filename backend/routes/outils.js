const express = require('express');

const outilsController = require('../controllers/outils');

const router = express.Router();

router.get('/all-fonds', outilsController.getAllFonds);

router.post('/add-fond', outilsController.postFond);

router.put('/save-fond', outilsController.putFond);

router.delete('/delete-fond/:id', outilsController.deleteFond);

router.get('/fiche-fond/:id', outilsController.consulterFond);

router.get('/rapport-plateformes/:annee', outilsController.rapportPlateformes);

router.get('/brut/:result', outilsController.getAllResultRapport);

module.exports = router;
