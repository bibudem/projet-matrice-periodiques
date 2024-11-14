const express = require('express');

const processusController = require('../controllers/processus');

const authMiddleware = require('../auth/authMiddleware');

const router = express.Router();

router.get('/all', authMiddleware, processusController.getAllProcessus);


router.get('/liste-details/:id', authMiddleware, processusController.getAllDetailsProcessus);


router.get('/last-processus', authMiddleware, processusController.getLastIdProcessus);


router.put('/save-prix', authMiddleware, processusController.postPrix);


router.put('/save-archives', authMiddleware, processusController.postArchives);


router.put('/update-statistiques', authMiddleware, processusController.postStatistiques);


router.post('/lot-periodiques', authMiddleware, processusController.postLotPeriodiques);


router.put('/add', authMiddleware, processusController.ajoutProcessus);


router.put('/save-abonnement', authMiddleware, processusController.postAbonnement);


router.delete('/delete/:id', authMiddleware, processusController.deleteProcessus);


router.delete('/details/delete/:id', authMiddleware, processusController.deleteProcessusDetails);


module.exports = router;
