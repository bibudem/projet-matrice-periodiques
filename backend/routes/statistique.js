const express = require('express');

const statistiqueController = require('../controllers/statistique');

const authMiddleware = require('../auth/authMiddleware');

const router = express.Router();

router.get('/all/:id', authMiddleware, statistiqueController.getAllStatistique);

router.get('/resume-all/:id', authMiddleware, statistiqueController.getAllResumeStatistique);

router.get('/moyenne/:id', authMiddleware, statistiqueController.mayenneStatistiques);

router.post('/add', authMiddleware, statistiqueController.postStatistique);

router.put('/save', authMiddleware, statistiqueController.putStatistique);

router.delete('/delete/:id', authMiddleware, statistiqueController.deleteStatistique);

router.get('/fiche/:id', authMiddleware, statistiqueController.consulterStatistique);

module.exports = router;
