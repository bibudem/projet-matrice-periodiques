const Periodique = require('../models/periodique');

exports.getAllPeriodiques = async (req, res, next) => {
  try {

    const [allPeriodiques] = await Periodique.fetchAll();
    res.status(200).json(allPeriodiques);


  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getAllRapport = async (req, res, next) => {
  try {

    const [allPeriodiques] = await Periodique.fetchRapportAll(req.params.plateforme);
    res.status(200).json(allPeriodiques);

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getAutresRapport = async (req, res, next) => {
  try {

    const [allPeriodiques] = await Periodique.fetchRapportAutres(req.params.plateforme);
    res.status(200).json(allPeriodiques);

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.postPeriodique = async (req, res, next) => {
  try {

    let values=Object.values(req.body);
    //console.log(Object.values(values));
    const postResponse = await Periodique.post(values);
    res.status(201).json(postResponse);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.putPeriodique = async (req, res, next) => {
  try {

    let values=Object.values(req.body);
    //console.log(Object.values(values));
    const putResponse = await Periodique.update(values);
    res.status(200).json(putResponse);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deletePeriodique = async (req, res, next) => {
  try {
    //console.log(req.params.id);
    const deleteResponse = await Periodique.delete(req.params.id);
    res.status(200).json(deleteResponse);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.consulterPeriodique = async (req, res, next) => {
  try {
    //console.log('consulter'+req.params.id);
    const [fichePeriodiques] = await Periodique.consulter(req.params.id);
    res.status(200).json(fichePeriodiques);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.postPeriodiqueConsultation2022 = async (req, res, next) => {
  try {
    let values=Object.values(req.body);
    let periodique= {}
    periodique.id=values[0]
    periodique.title=values[1]
    periodique.issn=values[2]
    periodique.eissn=values[3]
    periodique.domaine=values[4]
    //console.log(Object.values(values));
    //envoyer les données vers consultation 2022
    const options={
      url: "https://consultation2022.bib.umontreal.ca/titles",
      method: "POST",
      json: true,   // <--Very important!!!
      body: periodique
    }
    const request = require("request");
    //console.log(periodique)
    request(
      options,
      function (error, response,values ) {
        if (error) {
          res.status(201).json(error);
        }
        res.status(201).json([periodique]);
      }
    );

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
