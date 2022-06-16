const express = require('express');

const importCsvController = require('../controllers/import-csv');

const router = express.Router();

router.post('/add', importCsvController.postInCites);

router.get('/update/:annee', importCsvController.updateInCites);


module.exports = router;
