const express = require('express');
const listeStatistiqueController = require('../controllers/liste-statistique');
const authMiddleware = require('../auth/authMiddleware');

const router = express.Router();

router.get('/rapport/:periode', authMiddleware, listeStatistiqueController.rapportStatistiques);
router.get('/:annee', authMiddleware, listeStatistiqueController.getAllStatistique);

module.exports = router;
