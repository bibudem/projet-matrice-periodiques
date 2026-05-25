const express = require('express');
const importCsvController = require('../controllers/import-csv');
const authMiddleware = require('../auth/authMiddleware');

const router = express.Router();

router.post('/add', authMiddleware, importCsvController.postInCites);
router.get('/update/:annee', authMiddleware, importCsvController.updateInCites);

module.exports = router;
