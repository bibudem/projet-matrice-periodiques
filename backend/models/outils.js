const db = require('../util/database');
let SqlString = require('sqlstring'); //global declare
let datetime = require('node-datetime');

module.exports = class Outils {
  constructor() {
  }


  static getAllFonds() {
    //afficher la requette
    /*let sql = "SELECT * FROM lst_fonds order by titre "
    console.log('sql: ', SqlString.format(sql));*/
    return db.execute('SELECT * FROM lst_fonds order by titre');
  }

  static async postFond(fond) {
    //creation de la date
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');
    //console.log(date);
    //ajouter la date dans le tableau des données
    fond.push(date);
    //afficher la requette
   /*let sql = "INSERT INTO lst_fonds SET titre = ?,description =?,dateA =? "
    console.log('sql: ', SqlString.format(sql,[fond[0],fond[1],fond[2]]));*/
    return db.execute('INSERT INTO lst_fonds SET titre = ?,description =?,dateA =?', [fond[0],fond[1],fond[2]] );

  }

  static async putFond(fond) {
    //creation de la date
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');
    //afficher la requette
    /*let sql = "UPDATE lst_fonds SET titre = ?,description =?,dateM =? WHERE idFond  = ?"
    console.log('sql: ', SqlString.format(sql,[fond[1],fond[2],date, fond[0]]));*/

    return db.execute('UPDATE lst_fonds SET titre = ?,description =?,dateM =? WHERE idFond  = ?',
      [fond[1],fond[2],date, fond[0]]);

  }

  static async deleteFond(idFond) {
   /* let sql = "DELETE FROM lst_fonds WHERE idFond  = ?"
    console.log('sql: ', SqlString.format(sql,[idFond]));*/
    return db.execute('DELETE FROM lst_fonds WHERE idFond  = ?', [idFond]);
  }

//recouperer la fiche
  static consulterFond(idFond){
    return db.execute('SELECT * FROM lst_fonds WHERE idFond  = ?', [idFond]);
  }

  //creer le rapport des plateformes
 /* static getAllRapportPlateforme(annee) {
    //afficher la requette
    return db.execute("SELECT PlatformID AS acronyme,titrePlateforme,SUSHIURL,ConsortiumCustID,ConsortiumRequestorID,ConsortiumApiKey,dateA,dateM,(SELECT SUM(Reporting_Period_Total) FROM `tbl_results_j1`  WHERE Metric_Type='Total_Item_Requests' AND PlatformID=acronyme and annee=?) as total_tel,(SELECT SUM(Reporting_Period_Total) FROM `tbl_results_j1`  WHERE Metric_Type='Unique_Item_Requests' AND PlatformID=acronyme and annee=?) as unique_tel,(SELECT SUM(Reporting_Period_Total) FROM `tbl_results_j2`  WHERE Metric_Type='No_License' AND PlatformID=acronyme and annee=?) as refus FROM lst_plateformes order by titrePlateforme",[annee,annee,annee]);
  }*/
  static getAllRapportPlateforme(annee) {
    let sql = "SELECT" +
      "  lst.PlatformID," +
      "  lst.titrePlateforme," +
      "  lst.SUSHIURL," +
      "  lst.ConsortiumCustID," +
      "  lst.ConsortiumRequestorID," +
      "  lst.ConsortiumApiKey," +
      "  lst.dateA," +
      "  lst.dateM," +
      "  SUM(s.Total_Item_Requests) AS Total_Item_Requests," +
      "  SUM(s.No_License) AS No_License," +
      "  SUM(s.citations) AS citations," +
      "  SUM(s.articlesUdem) AS articlesUdem," +
      "  SUM(s.JR3OAGOLD) AS JR3OAGOLD, " +
      "  SUM(s.JR4COURANT) AS JR4COURANT, " +
      "  SUM(s.JR4INTER) AS JR4INTER, " +
      "  SUM(s.JR4RETRO) AS JR4RETRO " +
      " FROM " +
      "  lst_plateformes AS lst " +
      " LEFT JOIN " +
      "  tbl_statistiques AS s ON lst.PlatformID = s.plateforme AND s.annee = ?" +
      " GROUP BY " +
      "  lst.PlatformID," +
      "  lst.titrePlateforme," +
      "  lst.SUSHIURL," +
      "  lst.ConsortiumCustID," +
      "  lst.ConsortiumRequestorID," +
      "  lst.ConsortiumApiKey," +
      "  lst.dateA," +
      "  lst.dateM" +
      " ORDER BY " +
      "  lst.titrePlateforme;"
    console.log('sql: ', SqlString.format(sql,[annee]));
    //afficher la requette
    return db.execute("SELECT" +
      "  lst.PlatformID ," +
      "  lst.titrePlateforme," +
      "  lst.SUSHIURL," +
      "  lst.ConsortiumCustID," +
      "  lst.ConsortiumRequestorID," +
      "  lst.ConsortiumApiKey," +
      "  lst.dateA," +
      "  lst.dateM," +
      "  SUM(s.Total_Item_Requests) AS Total_Item_Requests," +
      "  SUM(s.No_License) AS No_License," +
      "  SUM(s.citations) AS citations," +
      "  SUM(s.articlesUdem) AS articlesUdem," +
      "  SUM(s.JR3OAGOLD) AS JR3OAGOLD, " +
      "  SUM(s.JR4COURANT) AS JR4COURANT, " +
      "  SUM(s.JR4INTER) AS JR4INTER, " +
      "  SUM(s.JR4RETRO) AS JR4RETRO " +
      " FROM " +
      "  lst_plateformes AS lst " +
      " LEFT JOIN " +
      "  tbl_statistiques AS s ON lst.PlatformID = s.plateforme AND s.annee = ?" +
      " GROUP BY " +
      "  lst.PlatformID," +
      "  lst.titrePlateforme," +
      "  lst.SUSHIURL," +
      "  lst.ConsortiumCustID," +
      "  lst.ConsortiumRequestorID," +
      "  lst.ConsortiumApiKey," +
      "  lst.dateA," +
      "  lst.dateM" +
      " ORDER BY " +
      "  lst.titrePlateforme;",[annee]);
  }

  //creer le rapport des plateformes
  static rapportMoyenne() {
    //afficher la requette
    return db.execute("SELECT tbl_periodiques.titre, tbl_periodiques.ISSN, tbl_periodiques.EISSN, tbl_periodiques.essentiel2014, tbl_periodiques.essentiel2022, tbl_periodiques.statut, tbl_statistiques.idRevue AS IdS, GROUP_CONCAT(DISTINCT tbl_statistiques.plateforme, ' ') AS plateforme,GROUP_CONCAT(DISTINCT tbl_periodiques.fournisseur, ' ') AS fournisseur,AVG(tbl_statistiques.Total_Item_Requests) AS moyenn_t,AVG(tbl_statistiques.No_License) AS moyenn_r,AVG(tbl_statistiques.citations) AS moyenn_c,AVG(tbl_statistiques.articlesUdem) AS moyenn_a,GROUP_CONCAT(tbl_statistiques.annee, ' ') AS annees FROM tbl_periodiques LEFT JOIN tbl_statistiques ON tbl_periodiques.idRevue = tbl_statistiques.idRevue WHERE tbl_statistiques.annee >= YEAR(NOW()) - 5 GROUP BY IdS");
  }

  //creer des view pour les rapports j1,j2,j4
  static getAllResultRapport(result) {
    let criteres=result.split('=')
    let plateforme=criteres[2]
    let annee=criteres[1]
    let rapport=criteres[3]
    let plateformeSql=''

    let table='tbl_results_'+rapport

    if(plateforme!='vide'){
       plateformeSql=" and PlatformID='"+plateforme+"'"
    }
    /*let sql = "SELECT * FROM "+table+"  WHERE annee=?  " +plateformeSql+ " order by PlatformID "
    console.log('sql: ', SqlString.format(sql,[annee]));*/

    return db.execute("SELECT * FROM "+table+"  WHERE annee=?  " +plateformeSql+ " order by Title ",[annee])
  }
  static allFournisseurs() {
    /*let sql = "SELECT * FROM lst_fournisseurs  order by titre"
    console.log('sql: ', SqlString.format(sql));*/
    return db.execute('SELECT * FROM lst_fournisseurs  order by titre');
  }

  static async addFournisseur(value) {
    //creation de la date
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');
    //ajouter la date dans le tableau des données
    value.push(date);
    //afficher la requette
    /*let sql = "INSERT INTO lst_fournisseurs SET titre = ?,description =?,dateA =? "
     console.log('sql: ', SqlString.format(sql,[value[0],value[1],value[2]]));*/
    return db.execute('INSERT INTO lst_fournisseurs SET titre = ?,description =?,dateA =?', [value[0],value[1],value[2]] );

  }

  static async putFournisseur(value) {
    //creation de la date
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');

    return db.execute('UPDATE lst_fournisseurs SET titre = ?,description =?,dateM =? WHERE idFournisseurs  = ?',
      [value[1],value[2],date, value[0]]);

  }

  static async deleteFournisseur(id) {
    return db.execute('DELETE FROM lst_fournisseurs WHERE idFournisseurs  = ?', [id]);
  }

//recouperer la fiche
  static ficheFournisseur(id){
    return db.execute('SELECT * FROM lst_fournisseurs WHERE idFournisseurs  = ?', [id]);
  }
};

