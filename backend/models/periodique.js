const db = require('../util/database');
let SqlString = require('sqlstring'); //global declare
let datetime = require('node-datetime');

module.exports = class Periodique {
  constructor(id,titre) {
  this.idRevue = id;
  this.titre = titre;
  this.ISSN = ISSN;
}


static fetchAll() {
  return db.execute('SELECT * FROM tbl_periodiques order by titre');
}

  static  fetchRapportAll(plateforme) {
    let i=0,sqlCondition=''
    let dt = datetime.create();
    let anneeFormat = dt.format('Y');
    let valPlateforme=plateforme.split('=')[1];

    if(valPlateforme!='vide'){
      sqlCondition=" WHERE `plateformePrincipale`='"+valPlateforme+"'"
    }
    /*let sql = 'SELECT `titre`,`EISSN`,`ISSN`,`statut`,`abonnement`,`fonds`,`fournisseur`,`plateformePrincipale`,`autrePlateforme`,`format`,`libreAcces`,`domaine`,`secteur`,`sujets`,`duplication`,`duplicationCourant`,`duplicationEmbargo1`,`duplicationEmbargo2`,`bdd`,`idRevue` as `idP`, ((SELECT SUM(prix) FROM tbl_prix_periodiques where (`annee`="'+(anneeFormat-1)+'" OR `annee`="'+(anneeFormat-2)+'") AND idRevue=idP) /(SELECT SUM(Total_Item_Requests) FROM tbl_statistiques where (`annee`="'+(anneeFormat-1)+'" OR `annee`="'+(anneeFormat-2)+'") AND idRevue=idP)) as prixUtil, (SELECT GROUP_CONCAT("Année:", annee, ", Prix: ", prix, ", ") from tbl_prix_periodiques WHERE `idRevue`=idP ) as prix FROM `tbl_periodiques` '+sqlCondition+'  order by idRevue';
    console.log('sql: ', SqlString.format(sql));*/
    //let result= db.execute('SELECT `titre`,`EISSN`,`ISSN`,`statut`,`abonnement`,`fonds`,`fournisseur`,`plateformePrincipale`,`autrePlateforme`,`format`,`libreAcces`,`domaine`,`secteur`,`sujets`,`duplication`,`duplicationCourant`,`duplicationEmbargo1`,`duplicationEmbargo2`,`bdd`,`idRevue` as `idP`, ((SELECT SUM(prix) FROM tbl_prix_periodiques where (`annee`="'+(anneeFormat-1)+'" OR `annee`="'+(anneeFormat-2)+'") AND idRevue=idP) /(SELECT SUM(Total_Item_Requests) FROM tbl_statistiques where (`annee`="'+(anneeFormat-1)+'" OR `annee`="'+(anneeFormat-2)+'") AND idRevue=idP)) as prixUtil, (SELECT GROUP_CONCAT("Année:", annee, ", Prix: ", prix, ", ") from tbl_prix_periodiques WHERE `idRevue`=idP ) as prix FROM `tbl_periodiques` '+sqlCondition+'  order by idRevue');
   // console.log(periodique)
    let result= db.execute('SELECT `titre`,`EISSN`,`ISSN`,`statut`,`abonnement`,`fonds`,`fournisseur`,`plateformePrincipale`,`autrePlateforme`,`format`,`libreAcces`,`domaine`,`secteur`,`sujets`,`duplication`,`duplicationCourant`,`duplicationEmbargo1`,`duplicationEmbargo2`,`bdd`,`idRevue` as `idP`, ((SELECT SUM(prix) FROM tbl_prix_periodiques where (`annee`="'+(anneeFormat-1)+'" OR `annee`="'+(anneeFormat-2)+'") AND idRevue=idP) /(SELECT SUM(Total_Item_Requests) FROM tbl_statistiques where (`annee`="'+(anneeFormat-1)+'" OR `annee`="'+(anneeFormat-2)+'") AND idRevue=idP)) as prixUtil FROM `tbl_periodiques` '+sqlCondition+'  order by idRevue');
    return result
  }

static post(periodique) {
  //creation de la date
  let dt = datetime.create();
  let date = dt.format('Y-m-d H:M:S');
  //console.log(date);
  //ajouter la date dans le tableau des données
  periodique.push(date);

  return db.execute('INSERT INTO tbl_periodiques SET titre = ?,ISSN = ?,EISSN =?,statut = ?,abonnement = ?,bdd = ?,fonds =?,fournisseur = ?,plateformePrincipale = ?,autrePlateforme =?,format = ?,libreAcces = ?,domaine =?,secteur = ?,sujets = ?,duplication =?,duplicationCourant =?,duplicationEmbargo1 =?,duplicationEmbargo2 =?,dateA =? ', periodique );
}

static update(periodique) {
   //creation de la date
  let dt = datetime.create();
  let date = dt.format('Y-m-d H:M:S');
  //afficher la requette
  /*let sql = "UPDATE tbl_periodiques SET titre = ?,ISSN = ?,EISSN=?,statut = ?,abonnement = ?,bdd = ?,fonds =?,fournisseur = ?,plateformePrincipale = ?,autrePlateforme =?,format = ?,libreAcces = ?,domaine =?,secteur = ?,sujets = ?,duplication =?,duplicationCourant =?,duplicationEmbargo1 =?,duplicationEmbargo2 =?,dateM =? WHERE idRevue  = ?"
  console.log('sql: ', SqlString.format(sql,[periodique[1],periodique[2],periodique[3],periodique[4],periodique[5],periodique[6],periodique[7],periodique[8],periodique[9],periodique[10],periodique[11],periodique[12],periodique[13],periodique[14],periodique[15],periodique[16],periodique[17],periodique[18],periodique[19],date, periodique[0]]));*/

  return db.execute('UPDATE tbl_periodiques SET titre = ?,ISSN = ?,EISSN=?,statut = ?,abonnement = ?,bdd = ?,fonds =?,fournisseur = ?,plateformePrincipale = ?,autrePlateforme =?,format = ?,libreAcces = ?,domaine =?,secteur = ?,sujets = ?,duplication =?,duplicationCourant =?,duplicationEmbargo1 =?,duplicationEmbargo2 =?,dateM =? WHERE idRevue  = ?',
                   [periodique[1],periodique[2],periodique[3],periodique[4],periodique[5],periodique[6],periodique[7],periodique[8],periodique[9],periodique[10],periodique[11],periodique[12],periodique[13],periodique[14],periodique[15],periodique[16],periodique[17],periodique[18],periodique[19],date, periodique[0]]);

}

static delete(idRevue) {
  return db.execute('DELETE FROM tbl_periodiques WHERE idRevue  = ?', [idRevue]);
}
//recouperer la fiche
static consulter(idRevue){
  return db.execute('SELECT * FROM tbl_periodiques WHERE idRevue  = ?', [idRevue]);
}

};

