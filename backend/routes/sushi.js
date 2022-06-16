const express = require('express');

const sushiController = require('../controllers/sushi');

const router = express.Router();



router.get('/rapports-sushi/:date', sushiController.getAllSushi);



module.exports = router;
