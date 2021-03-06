const express = require('express');

const processusController = require('../controllers/processus');

const router = express.Router();

router.get('/all', processusController.getAllProcessus);


router.put('/save-prix', processusController.postPrix);


router.put('/add', processusController.ajoutProcessus);


router.put('/save-abonnement', processusController.postAbonnement);


router.delete('/delete/:id', processusController.deleteProcessus);


module.exports = router;
