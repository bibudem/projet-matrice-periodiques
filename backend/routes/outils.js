const express = require('express');

const outilsController = require('../controllers/outils');

const router = express.Router();

router.get('/all-fonds', outilsController.getAllFonds);

router.post('/add-fond', outilsController.postFond);

router.put('/save-fond', outilsController.putFond);

router.delete('/delete-fond/:id', outilsController.deleteFond);

router.get('/fiche-fond/:id', outilsController.consulterFond);

router.get('/rapport-plateformes/:annee', outilsController.rapportPlateformes);

router.get('/rapport-moyenne', outilsController.rapportMoyenne);

router.get('/brut/:result', outilsController.getAllResultRapport);

router.get('/all-fournisseurs', outilsController.allFournisseurs);

router.get('/fiche-fournisseur/:id', outilsController.ficheFournisseur);

router.delete('/delete-fournisseur/:id', outilsController.deleteFournisseur);

router.post('/f-update', outilsController.putFournisseur);

router.post('/add-fournisseur', outilsController.addFournisseur);

module.exports = router;
