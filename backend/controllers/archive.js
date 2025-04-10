const Archive = require('../models/archive');

exports.getAllArchive = async (req, res, next) => {
  try {
    //retourner vers la connexion si on n'an une bonne session pour cet user
    const [allArchive] = await Archive.fetchAll(req.params.id);
    res.status(200).json(allArchive);

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};


exports.postArchive= async (req, res, next) => {
  try {
    //retourner vers la connexion si on n'an une bonne session pour cet user

    let values=Object.values(req.body);
    //console.log(values);
    const postResponse = await Archive.post(values);
    res.status(201).json(postResponse);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.putArchive = async (req, res, next) => {
  try {
    //retourner vers la connexion si on n'an une bonne session pour cet user

    let values=Object.values(req.body);
    //console.log(values);
    const putResponse = await Archive.update(values);
    res.status(200).json(putResponse);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteArchive = async (req, res, next) => {
  try {
    const deleteResponse = await Archive.delete(req.params.id);
    res.status(200).json(deleteResponse);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.consulterArchive = async (req, res, next) => {
  try {
    //console.log('consulter'+req.params.id);
    const [ficheArchive] = await Archive.consulter(req.params.id);
    res.status(200).json(ficheArchive);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
