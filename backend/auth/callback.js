
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
    const parsed = JSON.parse(user);
    const { family_name: nom = '', given_name: prenom = '', upn: courriel = '', groups = [] } = parsed;

    // Dépassement de groupes Azure (> 200) : la liste "groups" est remplacée par un renvoi vers Graph.
    // Signaler le cas pour diagnostiquer un refus d'accès inattendu (sans journaliser de données personnelles).
    if (!parsed.groups && parsed._claim_names?.groups) {
      console.warn('[auth] Jeton Azure sans "groups" (dépassement de groupes) : configurer Entra ID pour n\'émettre que les groupes assignés à l\'application.');
    }

    // Affecter les propriétés
    userConnect.nom = nom;
    userConnect.prenom = prenom;
    userConnect.courriel = courriel;

    // Déterminer le groupe
    if (groups.includes('bib-aut-matrice-dev-gestionnaires')) {
      userConnect.groupe = 'Admin';
    } else if (groups.includes('bib-aut-matrice-dev-lecteurs') || groups.includes('bib-usagers')) {
      userConnect.groupe = 'Viewer';
    }

    return [userConnect];
  }

}
