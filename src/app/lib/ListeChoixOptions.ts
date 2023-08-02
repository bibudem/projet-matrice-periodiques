//class qui regroupes les liste de choix pour differents champs
export class ListeChoixOptions  {

  //les options pour le select
  listPlateformesObj = [];

  //options abonnement
  listAbonnement = [
    { id: 1, name: "Individuel" },
    { id: 2, name: "Ensemble" }
  ];
  //options ddn
  bdd = [
    { id: 1, name: "Oui" },
    { id: 2, name: "Non" }
  ];
  //options ddn
  core = [
    { id: 1, name: "Oui" },
    { id: 2, name: "Non" }
  ];
  //options Statut
  listStatut = [
    { id: 1, name: "Actif" },
    { id: 2, name: "Inactif" }
  ];
  //options Format
  listFormat = [
    { id: 1, name: "Électronique" },
    { id: 2, name: "Papier" },
    { id: 3, name: "Élect. + Papier" }
  ];
  //options Domaine
  listDomaine = [
    { id: 1, name: "HAD" },
    { id: 2, name: "ScSo" },
    { id: 3, name: "SNG" },
    { id: 4, name: "SS" }
  ];
  //options SECTEUR
  listSecteurs = [
    { id: 1, name: "LSH" },
    { id: 2, name: "TGDAMLD" },
    { id: 3, name: "Santé" },
    { id: 4, name: "Sciences" }
  ];
  //objet pour les sujets
  listDevise = [
    {id: 1, name: 'CAD'},
    {id: 2, name: 'USD'},
    {id: 3, name: 'EUROS'},
    {id: 8, name: 'Autres'},
  ];
  //objet pour les sujets
  listFournisseurs = [
    {id: 1, name: 'Fourniseur 1'},
    {id: 2, name: 'Fourniseur 2'},
    {id: 3, name: 'Fourniseur 3'},
    {id: 8, name: 'Fourniseur 4'},
  ];
  //objet pour les sujets
  listeAcces = [
    {id: 1, name: 'Oui'},
    {id: 2, name: 'Non'},
    {id: 3, name: 'Hybride'},
  ];

  listeEntenteConsortiale = [
    {id: 1, name: ''},
    {id: 2, name: 'PBUB'},
    {id: 3, name: 'RCDR'},
  ];

  //objet pour les sujets
  essentiel = [
    {id: 1, name: 'Oui'},
    {id: 2, name: 'Non'}
  ];

  accesCourant = [
    {id: 1, name: 'Oui'},
    {id: 2, name: 'Non'}
  ];

  //objet pour les essentiel
  essentielListe14 = [
    {id: 1, name: 'Oui'}
  ];
  essentielListe22 = [
    {id: 1, name: 'Oui'}
  ];

}
