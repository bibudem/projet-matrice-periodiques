const Outils = require('../models/outils');
const auth = require("../auth/auth");
const Lib = require("../util/lib");

exports.getAllFonds = async (req, res, next) => {
  try {
    //retourner vers la connexion si on n'an une bonne session pour cet user
    if(Lib.userConnect(req).length==0){
      res.redirect('/api/logout');
    }
    const [donnees] = await Outils.getAllFonds();
      //console.log('all ok')
    res.status(200).json(donnees);

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postFond= async (req, res, next) => {
  try {
      //retourner vers la connexion si on n'an une bonne session pour cet user
      if(Lib.userConnect(req).length==0){
        res.redirect('/api/logout');
      }
      let values=Object.values(req.body);
      //console.log(values);
      const postResponse = await Outils.postFond(values);
      res.status(201).json(postResponse);

  } catch (err) {
    //console.log('controleur not ok');
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.putFond = async (req, res, next) => {
  try {
    //retourner vers la connexion si on n'an une bonne session pour cet user
    if(Lib.userConnect(req).length==0){
      res.redirect('/api/logout');
    }
    let values=Object.values(req.body);
    //console.log(Object.values(values));
    //console.log(values);
    const putResponse = await Outils.putFond(values);
    res.status(200).json(putResponse);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteFond = async (req, res, next) => {
  try {
    //retourner vers la connexion si on n'an une bonne session pour cet user
    if(Lib.userConnect(req).length==0){
      res.redirect('/api/logout');
    }
    //console.log(req.params.id);
    const deleteResponse = await Outils.deleteFond(req.params.id);
    res.status(200).json(deleteResponse);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.consulterFond = async (req, res, next) => {
  try {
    //retourner vers la connexion si on n'an une bonne session pour cet user
    if(Lib.userConnect(req).length==0){
      res.redirect('/api/logout');
    }
    //console.log('consulter'+req.params.id);
    const [ficheOutils] = await Outils.consulterFond(req.params.id);
    res.status(200).json(ficheOutils);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.rapportPlateformes = async (req, res, next) => {
  try {
    //retourner vers la connexion si on n'an une bonne session pour cet user
    if(Lib.userConnect(req).length==0){
      res.redirect('/api/logout');
    }

    const [donnees] = await Outils.getAllRapportPlateforme(req.params.annee);
    //console.log('all ok')
    res.status(200).json(donnees);

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.getAllResultRapport = async (req, res, next) => {
  try {
    //retourner vers la connexion si on n'an une bonne session pour cet user
    if(Lib.userConnect(req).length==0){
      res.redirect('/api/logout');
    }
    const [donnees] = await Outils.getAllResultRapport(req.params.result);
    //console.log('all ok')
    res.status(200).json(donnees);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
