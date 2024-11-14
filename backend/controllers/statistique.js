const Statistique = require('../models/statistique');

exports.getAllStatistique = async (req, res, next) => {
  try {
    const [allStatistique] = await Statistique.fetchAll(req.params.id);
    //console.log('all ok')
    res.status(200).json(allStatistique);

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getAllResumeStatistique = async (req, res, next) => {
  try {
    const [allStatistique] = await Statistique.fetchAllResume(req.params.id);
    //console.log('all ok')
    res.status(200).json(allStatistique);

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.mayenneStatistiques = async (req, res, next) => {
  try {
    const [allStatistique] = await Statistique.mayenneStatistiques(req.params.id);
    //console.log('all ok')
    res.status(200).json(allStatistique);

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};


exports.postStatistique= async (req, res, next) => {
  try {
    let values=Object.values(req.body);
   // console.log('controleur ok');
    const postResponse = await Statistique.post(values);
    res.status(201).json(postResponse);
  } catch (err) {
    //console.log('controleur not ok');
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.putStatistique = async (req, res, next) => {
  try {
    let values=Object.values(req.body);
    console.log(Object.values(values));
    //console.log(req.body.idStatistique);
    const putResponse = await Statistique.update( values);
    res.status(200).json(putResponse);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteStatistique = async (req, res, next) => {
  try {
    //console.log(req.params.id);
    const deleteResponse = await Statistique.delete(req.params.id);
    res.status(200).json(deleteResponse);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.consulterStatistique = async (req, res, next) => {
  try {
    //console.log('consulter'+req.params.id);
    const [ficheStatistique] = await Statistique.consulter(req.params.id);
    res.status(200).json(ficheStatistique);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
