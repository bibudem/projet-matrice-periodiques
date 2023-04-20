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
  static getAllRapportPlateforme(annee) {
    //afficher la requette
    return db.execute("SELECT PlatformID AS acronyme,titrePlateforme,SUSHIURL,ConsortiumCustID,ConsortiumRequestorID,ConsortiumApiKey,dateA,dateM,(SELECT SUM(Reporting_Period_Total) FROM `tbl_results_j1`  WHERE Metric_Type='Total_Item_Requests' AND PlatformID=acronyme and annee=?) as total_tel,(SELECT SUM(Reporting_Period_Total) FROM `tbl_results_j1`  WHERE Metric_Type='Unique_Item_Requests' AND PlatformID=acronyme and annee=?) as unique_tel,(SELECT SUM(Reporting_Period_Total) FROM `tbl_results_j2`  WHERE Metric_Type='No_License' AND PlatformID=acronyme and annee=?) as refus FROM lst_plateformes order by titrePlateforme",[annee,annee,annee]);
  }


  //creer le rapport des plateformes
  static rapportMoyenne() {
    //afficher la requette
    return db.execute("SELECT titre,ISSN,EISSN,essentiel2014,essentiel2022,statut,tbl_statistiques.idRevue as IdS,group_concat(plateforme,' ') as plateforme,SUM(Total_Item_Requests)/5 as moyenn_t,SUM(No_License)/5 as moyenn_r,SUM(citations)/5 as moyenn_c,SUM(articlesUdem)/5 as moyenn_a, group_concat(annee,' ') as annees FROM `tbl_periodiques` LEFT JOIN tbl_statistiques ON tbl_periodiques.idRevue=tbl_statistiques.idRevue where annee >= year(now()) - 5 group by IdS");
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

};

