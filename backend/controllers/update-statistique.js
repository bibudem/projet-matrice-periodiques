const UpdateStatistique = require('../models/update-statistique');
const Mail = require("../config/mail");
const UserAuth = require("../auth/callback");
const auth = require("../auth/auth");

exports.getAllStatistique = async (req, res, next) => {
  try {
    // Récupérer l'utilisateur connecté
    const userEmail =req.user.email;

    UpdateStatistique.getAllStatistique(req.params.annee).then( reponse => {
      let htmlContenu = "<p> La procédure de la mise à jour des statistiques est terminée! </p>" +
        "<p>Pour l'année choisie : <strong>" + req.params.annee + "</strong> le systéme a modifié les données statistiques pour  <strong>" + reponse + "</strong> des périodiques. </p>" +
        "<p>Veuillez consulter la liste complet<a href='https://matrice-dev.bib.umontreal.ca/liste-statistique/" + req.params.annee + "'> ici</a></p>"+
        "<p>Vérifier les journaux pour les plateformes qui ont donné des erreurs.</p>";
      //console.log('End update'+Lib.dateNow('d-m-Y H:M:S'));
      Mail.mailEnvoyer(userEmail,'Statistique',htmlContenu);
    });
    // console.log(allSushi)
    res.status(200).json(['ok']);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
