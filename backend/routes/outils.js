const express = require('express');
const outilsController = require('../controllers/outils');
const authMiddleware = require('../auth/authMiddleware');

const router = express.Router();

router.get('/all-fonds', authMiddleware, outilsController.getAllFonds);
router.post('/add-fond', authMiddleware, outilsController.postFond);
router.put('/save-fond', authMiddleware, outilsController.putFond);
router.delete('/delete-fond/:id', authMiddleware, outilsController.deleteFond);
router.get('/fiche-fond/:id', authMiddleware, outilsController.consulterFond);

router.get('/rapport-plateformes/:annee', authMiddleware, outilsController.rapportPlateformes);
router.get('/rapport-moyenne', authMiddleware, outilsController.rapportMoyenne);
router.get('/brut/:result', authMiddleware, outilsController.getAllResultRapport);

router.get('/all-fournisseurs', authMiddleware, outilsController.allFournisseurs);
router.get('/fiche-fournisseur/:id', authMiddleware, outilsController.ficheFournisseur);
router.delete('/delete-fournisseur/:id', authMiddleware, outilsController.deleteFournisseur);
router.post('/f-update', authMiddleware, outilsController.putFournisseur);
router.post('/add-fournisseur', authMiddleware, outilsController.addFournisseur);

module.exports = router;
