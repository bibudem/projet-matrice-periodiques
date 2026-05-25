const express = require('express');
const logsController = require('../controllers/logs');
const authMiddleware = require('../auth/authMiddleware');

const router = express.Router();

router.get('/all/:annee', authMiddleware, logsController.getAllLogsRevue);
router.get('/plateforme', authMiddleware, logsController.getAllLogsPlateforme);
router.get('/count', authMiddleware, logsController.getCount);
router.delete('/delete-logs-revue/:id', authMiddleware, logsController.deleteLogsRevue);
router.delete('/delete-logs-plateforme/:id', authMiddleware, logsController.deleteLogsPLateforme);

module.exports = router;
