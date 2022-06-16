const express = require('express');

const homeController = require('../controllers/home');

const router = express.Router();



router.get('/count', homeController.getCount);

router.get('/graphique', homeController.getGraphiqueDonnees);


module.exports = router;
