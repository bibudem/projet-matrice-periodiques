const Home = require('../models/home');

exports.getCount = async (req, res, next) => {
  try {
    const allChifres = await Home.fetchCountBoard();
    res.status(200).json(allChifres[0]); // Renvoyer uniquement les données nécessaires
  } catch (err) {
    err.statusCode = err.statusCode || 500;
    next(err);
  }
};

exports.getGraphiqueDonnees = async (req, res, next) => {
  try {
    const objGraphique = await Home.getGraphiqueDonnees();
    res.status(200).json(objGraphique[0]);
  } catch (err) {
    err.statusCode = err.statusCode || 500;
    next(err);
  }
};
