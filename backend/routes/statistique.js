const express = require('express');

const statistiqueController = require('../controllers/statistique');

const router = express.Router();

router.get('/all/:id', statistiqueController.getAllStatistique);

router.post('/add', statistiqueController.postStatistique);

router.put('/save', statistiqueController.putStatistique);

router.delete('/delete/:id', statistiqueController.deleteStatistique);

router.get('/fiche/:id', statistiqueController.consulterStatistique);

module.exports = router;
