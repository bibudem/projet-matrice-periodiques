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
exports.rapportMoyenne = async (req, res, next) => {
  try {
    //retourner vers la connexion si on n'an une bonne session pour cet user
    if(Lib.userConnect(req).length==0){
      res.redirect('/api/logout');
    }

    const [donnees] = await Outils.rapportMoyenne();
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
exports.putFournisseur = async (req, res, next) => {
  try {
    let values=Object.values(req.body);
    //console.log(Object.values(values));
    const putResponse = await Outils.putFournisseur(values);
    res.status(200).json(putResponse);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteFournisseur = async (req, res, next) => {
  try {
    //console.log(req.params.id);
    const deleteResponse = await Outils.deleteFournisseur(req.params.id);
    res.status(200).json(deleteResponse);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.ficheFournisseur = async (req, res, next) => {
  try {
    const [fiche] = await Outils.ficheFournisseur(req.params.id);
    res.status(200).json(fiche);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.allFournisseurs = async (req, res, next) => {
  try {
    const [all] = await Outils.allFournisseurs();
    res.status(200).json(all);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.addFournisseur = async (req, res, next) => {
  try {
    let values=Object.values(req.body);
    //console.log(Object.values(values));
    const postResponse = await Outils.addFournisseur(values);
    res.status(201).json(postResponse);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
