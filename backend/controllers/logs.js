const Logs = require('../models/logs');

exports.getCount = async (req, res, next) => {
  try {
    const [allLogsRevue] = await Logs.fetchCount();

    res.status(200).json(allLogsRevue);

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.getAllLogsRevue = async (req, res, next) => {
  try {
    const [allLogsRevue] = await Logs.fetchAllLogsRevue(req.params.annee);
    //console.log('Logs revues'+ req.params.annee )
    res.status(200).json(allLogsRevue);

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.getAllLogsPlateforme = async (req, res, next) => {
  try {

    const [allLogsPlateforme] = await Logs.fetchAllLogsPlateforme();
    //console.log('all ok')
    res.status(200).json(allLogsPlateforme);

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.deleteLogsRevue = async (req, res, next) => {
  try {
    //console.log(req.params.id);
    const deleteResponse = await Logs.deleteLogsRevue(req.params.id);
    res.status(200).json(deleteResponse);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.deleteLogsPLateforme = async (req, res, next) => {
  try {
    //console.log('controleur'+req.params.id);
    const deleteResponse = await Logs.deleteLogsPLateforme(req.params.id);
    res.status(200).json(deleteResponse);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};


