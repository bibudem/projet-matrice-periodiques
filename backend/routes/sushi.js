const express = require('express');

const sushiController = require('../controllers/sushi');

const authMiddleware = require('../auth/authMiddleware');

const router = express.Router();



router.get('/rapports-sushi/:date', authMiddleware, sushiController.getAllSushi);



module.exports = router;
