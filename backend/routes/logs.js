const express = require('express');

const logsController = require('../controllers/logs');

const router = express.Router();

router.get('/revue', logsController.getAllLogsRevue);

router.get('/plateforme', logsController.getAllLogsPlateforme);

router.get('/count', logsController.getCount);

router.delete('/delete-logs-revue/:id', logsController.deleteLogsRevue);

router.delete('/delete-logs-plateforme/:id', logsController.deleteLogsPLateforme);


module.exports = router;
