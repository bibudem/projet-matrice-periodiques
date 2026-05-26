const Home = require('../models/home');

const ANNEE_DEFAUT = new Date().getFullYear() - 1;

exports.getCount = async (req, res, next) => {
  try {
    const annee = parseInt(req.query.annee) || ANNEE_DEFAUT;
    const result = await Home.fetchCountBoard(annee);
    res.status(200).json(result[0]);
  } catch (err) {
    err.statusCode = err.statusCode || 500;
    next(err);
  }
};

exports.getGraphiqueDonnees = async (req, res, next) => {
  try {
    const annee = parseInt(req.query.annee) || ANNEE_DEFAUT;
    const result = await Home.getGraphiqueDonnees(annee);
    res.status(200).json(result[0]);
  } catch (err) {
    err.statusCode = err.statusCode || 500;
    next(err);
  }
};
