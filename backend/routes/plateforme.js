const express = require('express');
const plateformeController = require('../controllers/plateforme');
const authMiddleware = require('../auth/authMiddleware');

const router = express.Router();

router.get('/all', authMiddleware, plateformeController.getAllPlateforme);
router.post('/add', authMiddleware, plateformeController.postPlateforme);
router.put('/save', authMiddleware, plateformeController.putPlateforme);
router.delete('/delete/:id', authMiddleware, plateformeController.deletePlateforme);
router.get('/fiche/:id', authMiddleware, plateformeController.consulterPlateforme);

module.exports = router;
