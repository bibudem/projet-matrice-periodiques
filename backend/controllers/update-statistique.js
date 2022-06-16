const UpdateStatistique = require('../models/update-statistique');
const Mail = require("../config/mail");
const Lib  = require("../util/lib");

exports.getAllStatistique = async (req, res, next) => {
  try {
    //retourner vers la connexion si on n'an une bonne session pour cet user
    if(Lib.userConnect(req).length==0){
      res.redirect('/api/logout');
    }
    //dans la réponse d'authentification le paramettre upn represente le courriel de la personne connecté
    let courriel = Lib.userConnect(req).upn;
    //console.log(res);
    //console.log(req);
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
