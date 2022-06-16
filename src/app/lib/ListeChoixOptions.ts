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
    { id: 1, name: "électronique" },
    { id: 2, name: "papier" },
    { id: 3, name: "hybride" }
  ];
  //options Domaine
  listDomaine = [
    { id: 1, name: "DSSH" },
    { id: 2, name: "HAD" },
    { id: 3, name: "ScSo" },
    { id: 4, name: "SNG" },
    { id: 5, name: "SS" }
  ];
  //options SECTEUR
  listSecteurs = [
    { id: 1, name: "Droit" },
    { id: 2, name: "EPC-AML" },
    { id: 3, name: "LSH" },
    { id: 4, name: "Santé" },
    { id: 5, name: "Sciences" }
  ];
  //objet pour les sujets
  sujetsListe = [
    {id: 1, name: 'sujet 1'},
    {id: 2, name: 'sujet 2'},
    {id: 3, name: 'sujet 3'},
    {id: 8, name: 'sujet 4'},
  ];
  //objet pour les sujets
  listeAcces = [
    {id: 1, name: 'Oui'},
    {id: 2, name: 'Non'},
    {id: 3, name: 'Hybride'},
  ];


}
