const express = require('express');

const historiqueController = require('../controllers/historique');

const authMiddleware = require('../auth/authMiddleware');

const router = express.Router();

router.get('/all/:id', authMiddleware, historiqueController.getAllHistorique);

router.post('/add', authMiddleware, historiqueController.postHistorique);

router.put('/save', authMiddleware, historiqueController.putHistorique);

router.delete('/delete/:id', authMiddleware, historiqueController.deleteHistorique);

router.get('/fiche/:id', authMiddleware, historiqueController.consulterHistorique);

module.exports = router;
