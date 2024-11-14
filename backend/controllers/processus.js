const Processus = require('../models/processus');

exports.getAllProcessus = async (req, res, next) => {
  try {

    const [allProcessus] = await Processus.fetchAll();

    res.status(200).json(allProcessus);

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.getAllDetailsProcessus = async (req, res, next) => {
  try {
    const [allProcessusDetails] = await Processus.getAllDetailsProcessus(req.params.id);

    res.status(200).json(allProcessusDetails);

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.getLastIdProcessus = async (req, res, next) => {
  try {
    const [lastIdProcessus] = await Processus.getLastIdProcessus();
    res.status(200).json(lastIdProcessus);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.postPrix= async (req, res, next) => {
  try {
    let values=Object.values(req.body);
    //console.log(req.body)
    //console.log('update prix')
    const postResponse = await Processus.postPrix(values);
    res.status(201).json(postResponse);
  } catch (err) {
    //console.log('controleur not ok');
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.postArchives= async (req, res, next) => {
  try {
    let values=Object.values(req.body);
    //console.log(req.body)
    //console.log('update prix')
    const postResponse = await Processus.postArchives(values);
    res.status(201).json(postResponse);
  } catch (err) {
    //console.log('controleur not ok');
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.postStatistiques = async (req, res, next) => {
  try {
    const values = Object.values(req.body);
    const postResponse = await Processus.postStatistiques(values);
    res.status(201).json(postResponse);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.postLotPeriodiques= async (req, res, next) => {
  try {
    let values=Object.values(req.body);
    //console.log(values);
    const postResponse = await Processus.postPeriodiques(values);
    res.status(201).json(postResponse);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.ajoutProcessus=  async (req, res, next) => {
  try {
    let values=Object.values(req.body);
    //console.log(req.body)
    const addProcessus = await Processus.ajoutProcessus(values);
    res.status(201).json(addProcessus);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.postAbonnement= async (req, res, next) => {
  try {
    let values=Object.values(req.body);
    //console.log('controleur ok');
    const postResponse = Processus.postAbonnement(values);
    res.status(201).json(postResponse);
  } catch (err) {
    //console.log('controleur not ok');
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.deleteProcessus = async (req, res, next) => {
  try {
    //console.log(req.params.id);
    const deleteResponse = await Processus.delete(req.params.id);
    res.status(200).json(deleteResponse);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.deleteProcessusDetails = async (req, res, next) => {
  try {
    //console.log(req.params.id);
    const deleteDetails = await Processus.deleteProcessusDetails(req.params.id);
    res.status(200).json(deleteDetails);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

