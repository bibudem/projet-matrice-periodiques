const Sushi = require('../models/sushi');
const Mail = require("../config/mail");



exports.getAllSushi =  async (req, res, next) => {
  try {
    //console.log(req);
    // Récupérer l'utilisateur connecté
    const userEmail =req.user.email;

    // Extraire le courriel de l'utilisateur connecté
    Sushi.fetchAll(req.params.date).then(reponse => {
        console.log(reponse);
        let anneePost=req.params.date.split('=')[1]
        let htmlContenu = "<p> La procédure d'importation sushi est terminée! </p>" +
          "<p>Pour la période choisie : <strong>" + anneePost + "</strong> le systéme a importé des données SUSHI. </p>" +
          "<p>Vous pouvez vérifier les données dans la liste des statistiques ou dans les rapports des statistiques.</p>";

          Mail.mailEnvoyer(userEmail,'Statistique',htmlContenu);
        });
         res.status(200).json(['successful'])

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
