const Logs = require('../models/home');
const auth = require("../auth/auth");
const Lib = require("../util/lib");

exports.getCount = async (req, res, next) => {
  try {
    //retourner vers la connexion si on n'an une bonne session pour cet user
    if(Lib.userConnect(req).length==0){
      res.redirect('/api/logout');
    }
    const [allChifres] = await Logs.fetchCountBoard();
    //console.log(allChifres)
    res.status(200).json(allChifres);

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getGraphiqueDonnees = async (req, res, next) => {
  try {
    //retourner vers la connexion si on n'an une bonne session pour cet user
    if(Lib.userConnect(req).length==0){
      res.redirect('/api/logout');
    }

    const [objGraphique] = await Logs.getGraphiqueDonnees();
    //console.log(objGraphique)
    res.status(200).json(objGraphique);

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
