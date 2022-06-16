const InCites = require('../models/import-csv');
const Lib = require("../util/lib");

exports.postInCites= async (req, res, next) => {
  try {
    //retourner vers la connexion si on n'an une bonne session pour cet user
    if(Lib.userConnect(req).length==0){
      res.redirect('/api/logout');
    }
    let values=Object.values(req.body);
    //console.log(values)
    const postResponse = await InCites.post(values);
    res.status(201).json(postResponse);
  } catch (err) {
    console.log('controleur not ok');
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

  exports.updateInCites= async (req, res, next) => {
    try {
      //retourner vers la connexion si on n'an une bonne session pour cet user
      if(Lib.userConnect(req).length==0){
        res.redirect('/api/logout');
      }
     // console.log('contr update');
      let annee=req.params.annee
     // console.log(annee);
      const postResponse = await InCites.update(annee);
      res.status(201).json(postResponse);
    } catch (err) {
      //console.log('controleur not ok');
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
};

