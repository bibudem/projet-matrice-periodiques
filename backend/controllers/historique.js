const Historique = require('../models/historique');

exports.getAllHistorique = async (req, res, next) => {
  try {
    const [allArchive] = await Historique.fetchAll(req.params.id);
    //console.log('all ok')
    res.status(200).json(allArchive);

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};


exports.postHistorique= async (req, res, next) => {
  try {
    let values=Object.values(req.body);
   // console.log(values);
    const postResponse = await Historique.post(values);
    res.status(201).json(postResponse);
  } catch (err) {
    //console.log('controleur not ok');
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.putHistorique = async (req, res, next) => {
  try {
    let values=Object.values(req.body);
   // console.log(Object.values(values));
    const putResponse = await Historique.update(values);
    res.status(200).json(putResponse);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteHistorique = async (req, res, next) => {
  try {
   // console.log(req.params.id);
    const deleteResponse = await Historique.delete(req.params.id);
    res.status(200).json(deleteResponse);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.consulterHistorique = async (req, res, next) => {
  try {
    //console.log('consulter'+req.params.id);
    const [ficheArchive] = await Historique.consulter(req.params.id);
    res.status(200).json(ficheArchive);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
