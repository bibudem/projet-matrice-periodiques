const Sushi = require('../models/sushi');
const auth = require("../auth/auth");
const Mail = require("../config/mail")
const Lib  = require("../util/lib");
const text = require("../util/string");



exports.getAllSushi =  async (req, res, next) => {
  try {
    //retourner vers la connexion si on n'an une bonne session pour cet user
    if(Lib.userConnect(req).length==0){
      res.redirect('/api/logout');
    }
    //dans la réponse d'authentification le paramettre upn represente le courriel de la personne connecté
    let courriel=Lib.userConnect(req).upn;
    Sushi.fetchAll(req.params.date).then(reponse => {
        let anneePost=req.params.date.split('=')[1]
        let htmlContenu = "<p> La procédure d'importation sushi est terminée! </p>" +
          "<p>Pour la période choisie : <strong>" + anneePost + "</strong> le systéme a importé des données sushi sur  <strong>" + reponse + "</strong> plateformes. </p>" +
          "<p>Vous pouvez vérifier les données dans la liste des statistiques ou dans les rapports des statistiques.</p>";
          //console.log('End update'+Lib.dateNow('d-m-Y H:M:S'));
          Mail.mailEnvoyer(courriel,'Statistique',htmlContenu);
        });
         res.status(200).json(['successful'])

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
