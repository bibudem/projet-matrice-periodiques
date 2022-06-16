const express = require('express');

const updateStatistiqueController = require('../controllers/update-statistique');

const router = express.Router();

router.get('/:annee', updateStatistiqueController.getAllStatistique);



module.exports = router;
