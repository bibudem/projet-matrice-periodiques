const Note = require('../models/note');

exports.getAllNote = async (req, res, next) => {
  try {
    const [allArchive] = await Note.fetchAll(req.params.id);
    //console.log('all ok')
    res.status(200).json(allArchive);

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};


exports.postNote= async (req, res, next) => {
  try {
    let values=Object.values(req.body);
    //console.log('controleur ok');
    const postResponse = await Note.post(values);
    res.status(201).json(postResponse);
  } catch (err) {
   /// console.log('controleur not ok');
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.putNote = async (req, res, next) => {
  try {
    let values=Object.values(req.body);
    const putResponse = await Note.update(values);
    res.status(200).json(putResponse);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteNote = async (req, res, next) => {
  try {
    //console.log(req.params.id);
    const deleteResponse = await Note.delete(req.params.id);
    res.status(200).json(deleteResponse);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.consulterNote = async (req, res, next) => {
  try {
    //console.log('consulter'+req.params.id);
    const [ficheNote] = await Note.consulter(req.params.id);
    res.status(200).json(ficheNote);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
