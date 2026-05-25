const express = require('express');
const prixController = require('../controllers/prix');
const authMiddleware = require('../auth/authMiddleware');

const router = express.Router();

router.get('/all/:id', authMiddleware, prixController.getAllPrix);
router.post('/add', authMiddleware, prixController.postPrix);
router.put('/save', authMiddleware, prixController.putPrix);
router.delete('/delete/:id', authMiddleware, prixController.deletePrix);
router.get('/fiche/:id', authMiddleware, prixController.consulterPrix);

module.exports = router;
