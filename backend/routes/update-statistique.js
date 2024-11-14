const express = require('express');

const updateStatistiqueController = require('../controllers/update-statistique');

const authMiddleware = require('../auth/authMiddleware');

const router = express.Router();

router.get('/:annee', authMiddleware, updateStatistiqueController.getAllStatistique);



module.exports = router;
