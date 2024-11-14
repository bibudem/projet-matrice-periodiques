const Plateforme = require('../models/plateforme');

exports.getAllPlateforme = async (req, res, next) => {
  try {
    const [allPlateforme] = await Plateforme.fetchAll();
    //console.log(allPlateforme);
    res.status(200).json(allPlateforme);

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};


exports.postPlateforme= async (req, res, next) => {
  try {
    let values=Object.values(req.body);
    //console.log('controleur ok');
    const postResponse = await Plateforme.post(values);
    res.status(201).json(postResponse);
  } catch (err) {
    //console.log('controleur not ok');
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.putPlateforme = async (req, res, next) => {
  try {
    let values=Object.values(req.body);
    //console.log(Object.values(values));
    const putResponse = await Plateforme.update(req.body.idPlateforme, values);
    res.status(200).json(putResponse);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deletePlateforme = async (req, res, next) => {
  try {
    //console.log(req.params.id);
    const deleteResponse = await Plateforme.delete(req.params.id);
    res.status(200).json(deleteResponse);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.consulterPlateforme = async (req, res, next) => {
  try {
    //console.log('consulter'+req.params.id);
    const [fichePlateforme] = await Plateforme.consulter(req.params.id);
    res.status(200).json(fichePlateforme);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
