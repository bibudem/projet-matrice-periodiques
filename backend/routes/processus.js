const express = require('express');

const processusController = require('../controllers/processus');

const router = express.Router();

router.get('/all', processusController.getAllProcessus);


router.get('/liste-details/:id', processusController.getAllDetailsProcessus);


router.get('/last-processus', processusController.getLastIdProcessus);


router.put('/save-prix', processusController.postPrix);


router.put('/update-statistiques', processusController.postStatistiques);


router.post('/lot-periodiques', processusController.postLotPeriodiques);


router.put('/add', processusController.ajoutProcessus);


router.put('/save-abonnement', processusController.postAbonnement);


router.delete('/delete/:id', processusController.deleteProcessus);


router.delete('/details/delete/:id', processusController.deleteProcessusDetails);


module.exports = router;
