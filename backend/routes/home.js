const express = require('express');

const homeController = require('../controllers/home');

const authMiddleware = require('../auth/authMiddleware');

const router = express.Router();



router.get('/count', authMiddleware, homeController.getCount);

router.get('/graphique', authMiddleware, homeController.getGraphiqueDonnees);


module.exports = router;
