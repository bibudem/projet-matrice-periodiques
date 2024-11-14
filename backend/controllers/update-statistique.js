const UpdateStatistique = require('../models/update-statistique');
const Mail = require("../config/mail");
const UserAuth = require("../auth/callback");
const auth = require("../auth/auth");

exports.getAllStatistique = async (req, res, next) => {
  try {
    //dans la réponse d'authentification le paramettre upn represente le courriel de la personne connecté
    const token = req.session ? req.session.token : null;
    const user = auth.passport.session.userConnect[token];
    const ficheUser = await UserAuth.returnUserUdem(user);
    let courriel = ficheUser[0]['courriel'];

    UpdateStatistique.getAllStatistique(req.params.annee).then( reponse => {
      let htmlContenu = "<p> La procédure de la mise à jour des statistiques est terminée! </p>" +
        "<p>Pour l'année choisie : <strong>" + req.params.annee + "</strong> le systéme a modifié les données statistiques pour  <strong>" + reponse + "</strong> des périodiques. </p>" +
        "<p>Veuillez consulter la liste complet<a href='https://matrice-dev.bib.umontreal.ca/liste-statistique/" + req.params.annee + "'> ici</a></p>"+
        "<p>Vérifier les journaux pour les plateformes qui ont donné des erreurs.</p>";
      //console.log('End update'+Lib.dateNow('d-m-Y H:M:S'));
      Mail.mailEnvoyer(courriel,'Statistique',htmlContenu);
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
