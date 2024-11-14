const InCites = require('../models/import-csv');

exports.postInCites= async (req, res, next) => {
  try {
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

