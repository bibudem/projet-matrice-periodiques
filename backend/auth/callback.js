
module.exports = class UserAuth {

  constructor() {

  }

  static async returnUserUdem(user) {
    // Initialiser un utilisateur par défaut avant la validation de la connexion
    let userConnect = {
      nom: '',
      prenom: '',
      courriel: '',
      groupe: 'not-user'
    };

    if (!user) {
      return [userConnect];
    }

    // Parser l'utilisateur et récupérer les valeurs nécessaires
    const { family_name: nom = '', given_name: prenom = '', upn: courriel = '', groups = [] } = JSON.parse(user);

    // Affecter les propriétés
    userConnect.nom = nom;
    userConnect.prenom = prenom;
    userConnect.courriel = courriel;

    // Déterminer le groupe
    if (groups.includes('bib-aut-matrice-dev-gestionnaires')) {
      userConnect.groupe = 'Admin';
    } else if (groups.includes('bib-aut-matrice-dev-lecteurs')) {
      userConnect.groupe = 'Viewer';
    }

    return [userConnect];
  }

}
