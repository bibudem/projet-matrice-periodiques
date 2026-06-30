const express = require('express');

const processusController = require('../controllers/processus');

const authMiddleware = require('../auth/authMiddleware');

const router = express.Router();

router.get('/all', authMiddleware, processusController.getAllProcessus);


router.get('/liste-details/:id', authMiddleware, processusController.getAllDetailsProcessus);
router.get('/liste-details-paginated/:id', authMiddleware, processusController.getAllDetailsProcessusPaginated);


router.get('/last-processus', authMiddleware, processusController.getLastIdProcessus);


router.put('/save-prix', authMiddleware, processusController.postPrix);
router.put('/bulk-save-prix', authMiddleware, processusController.postBulkPrix);

router.put('/save-archives', authMiddleware, processusController.postArchives);
router.put('/bulk-save-archives', authMiddleware, processusController.postBulkArchives);

router.put('/update-statistiques', authMiddleware, processusController.postStatistiques);
router.put('/bulk-update-statistiques', authMiddleware, processusController.postBulkStatistiques);


router.post('/update-list-periodiques', authMiddleware, processusController.postListUpdatePeriodiques);
router.post('/bulk-update-periodiques', authMiddleware, processusController.postBulkUpdatePeriodiques);

router.post('/lot-periodiques', authMiddleware, processusController.postLotPeriodiques);
router.post('/bulk-lot-periodiques', authMiddleware, processusController.postBulkLotPeriodiques);


router.put('/add', authMiddleware, processusController.ajoutProcessus);


router.put('/save-abonnement', authMiddleware, processusController.postAbonnement);
router.put('/bulk-save-abonnement', authMiddleware, processusController.postBulkAbonnement);


router.delete('/delete/:id', authMiddleware, processusController.deleteProcessus);


router.delete('/details/delete/:id', authMiddleware, processusController.deleteProcessusDetails);


module.exports = router;
