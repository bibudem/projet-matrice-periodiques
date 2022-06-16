const ListeStatistique = require('../models/liste-statistique');
const auth = require("../auth/auth");
const Lib = require("../util/lib");


exports.getAllStatistique = async (req, res, next) => {
  try {
    //retourner vers la connexion si on n'an une bonne session pour cet user
    if(Lib.userConnect(req).length==0){
      res.redirect('/api/logout');
    }
    const allStatistique = await ListeStatistique.fetchAll(req.params.annee);
    // console.log(allSushi)
    res.status(200).json(allStatistique);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.rapportStatistiques = async (req, res, next) => {
  try {
    //retourner vers la connexion si on n'an une bonne session pour cet user
    if(Lib.userConnect(req).length==0){
      res.redirect('/api/logout');
    }
    const allRapport =  await ListeStatistique.donneesStatistiqueRapport(req.params.periode);

    res.status(200).json(allRapport[0][0]);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.rapportStatistiquesPlateforme = async (req, res, next) => {
  try {
    //retourner vers la connexion si on n'an une bonne session pour cet user
    if(Lib.userConnect(req).length==0){
      res.redirect('/api/logout');
    }
    const allRapport =  await ListeStatistique.statistiquesRapportPlateforme(req.params.periode);
    res.status(200).json(allRapport[0][0]);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
