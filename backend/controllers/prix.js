const Prix = require('../models/prix');
const auth = require("../auth/auth");
const Lib = require("../util/lib");

exports.getAllPrix = async (req, res, next) => {
  try {
    //retourner vers la connexion si on n'an une bonne session pour cet user
    if(Lib.userConnect(req).length==0){
      res.redirect('/api/logout');
    }

    const [allPrix] = await Prix.fetchAll(req.params.id);
    //console.log('all ok')
    res.status(200).json(allPrix);

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};


exports.postPrix= async (req, res, next) => {
  try {
    //retourner vers la connexion si on n'an une bonne session pour cet user
    if(Lib.userConnect(req).length==0){
      res.redirect('/api/logout');
    }
    let values=Object.values(req.body);
    //console.log('controleur ok');
    const postResponse = await Prix.post(values);
    res.status(201).json(postResponse);
  } catch (err) {
    //console.log('controleur not ok');
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.putPrix = async (req, res, next) => {
  try {
    //retourner vers la connexion si on n'an une bonne session pour cet user
    if(Lib.userConnect(req).length==0){
      res.redirect('/api/logout');
    }
    let values=Object.values(req.body);
    //console.log(Object.values(values));
    //console.log(req.body.idNote);
    const putResponse = await Prix.update(values);
    res.status(200).json(putResponse);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deletePrix = async (req, res, next) => {
  try {
    //retourner vers la connexion si on n'an une bonne session pour cet user
    if(Lib.userConnect(req).length==0){
      res.redirect('/api/logout');
    }
    //console.log(req.params.id);
    const deleteResponse = await Prix.delete(req.params.id);
    res.status(200).json(deleteResponse);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.consulterPrix = async (req, res, next) => {
  try {
    //retourner vers la connexion si on n'an une bonne session pour cet user
    if(Lib.userConnect(req).length==0){
      res.redirect('/api/logout');
    }
    //console.log('consulter'+req.params.id);
    const [fichePrix] = await Prix.consulter(req.params.id);
    res.status(200).json(fichePrix);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
