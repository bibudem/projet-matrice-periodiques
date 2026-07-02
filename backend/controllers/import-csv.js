const InCites = require('../models/import-csv');

exports.postInCites = async (req, res, next) => {
  try {
    const count = await InCites.post(Object.values(req.body));
    res.status(201).json([count]);
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.postBulkInCites = async (req, res, next) => {
  try {
    const postResponse = await InCites.postBulk(req.body);
    res.status(201).json(postResponse);
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.updateInCites = async (req, res, next) => {
  try {
    const annee = req.params.annee;
    const postResponse = await InCites.update(annee);
    res.status(201).json(postResponse);
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};
