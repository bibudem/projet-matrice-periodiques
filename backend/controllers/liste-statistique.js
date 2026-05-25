const ListeStatistique = require('../models/liste-statistique');


exports.getAllStatistique = async (req, res, next) => {
  try {
    const skip = parseInt(req.query.skip);
    const limit = parseInt(req.query.limit);

    if (!isNaN(skip) && !isNaN(limit)) {
      const search = req.query.search || '';
      const sortColumn = req.query.sortColumn || 'titre';
      const sortDirection = req.query.sortDirection || 'asc';
      const paginatedResult = await ListeStatistique.fetchAllPaginated(req.params.annee, skip, limit, search, sortColumn, sortDirection);
      const countResult = await ListeStatistique.countAll(req.params.annee, search);
      res.status(200).json({
        data: paginatedResult[0],
        total: countResult[0][0].count || 0,
        skip,
        limit
      });
    } else {
      const allStatistique = await ListeStatistique.fetchAll(req.params.annee);
      res.status(200).json(allStatistique);
    }
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

