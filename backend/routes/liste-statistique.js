const express = require('express');

const listeStatistiqueController = require('../controllers/liste-statistique');

const router = express.Router();

router.get('/:annee', listeStatistiqueController.getAllStatistique);

router.get('/rapport/:periode', listeStatistiqueController.rapportStatistiques);

router.get('/plateforme-rapport/:periode', listeStatistiqueController.rapportStatistiquesPlateforme);



module.exports = router;
