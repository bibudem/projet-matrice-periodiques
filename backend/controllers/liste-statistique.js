const ListeStatistique = require('../models/liste-statistique');


exports.getAllStatistique = async (req, res, next) => {
  try {
    const allStatistique = await ListeStatistique.fetchAll(req.params.annee);
    // console.log(allSushi)
    res.status(200).json(allStatistique);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.rapportStatistiques = async (req, res, next) => {
  try {
    const allRapport =  await ListeStatistique.donneesStatistiqueRapport(req.params.periode);

    res.status(200).json(allRapport[0]);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

