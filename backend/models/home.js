const db = require('../util/database');
let SqlString = require('sqlstring'); //global declare
let datetime = require('node-datetime');

module.exports = class Logs {
  constructor() {

  }


  static async fetchCountBoard() {
    //creation de l'année
    let dt = datetime.create();
    let annee = dt.format('Y')-1;

    //afficher la requette
    /*let sql = "SELECT COUNT(idRevue ) as count FROM tbl_periodiques UNION SELECT SUM(Total_Item_Requests) as count FROM tbl_statistiques where annee=? UNION SELECT SUM(citations) as count FROM tbl_statistiques where annee=? UNION SELECT SUM(articlesUdem) as count FROM tbl_statistiques where annee=?"
    console.log('sql: ', SqlString.format(sql,[annee,annee,annee]));*/

    return db.execute('SELECT COUNT(idRevue ) as count FROM tbl_periodiques UNION SELECT SUM(Total_Item_Requests) as count FROM tbl_statistiques where annee=? UNION SELECT SUM(citations) as count FROM tbl_statistiques where annee=? UNION SELECT SUM(articlesUdem) as count FROM tbl_statistiques where annee=?',[annee,annee,annee]);
  }

  static getGraphiqueDonnees() {
    //creation de l'année
    let dt = datetime.create();
    let annee = dt.format('Y')-1;

    return db.execute('SELECT (DISTINCT titre) as titre,Total_Item_Requests,Unique_Item_Requests,No_License FROM `tbl_statistiques` INNER JOIN `tbl_periodiques` on tbl_statistiques.`idRevue`=tbl_periodiques.`idRevue`  WHERE `annee`=? ORDER BY CAST(Total_Item_Requests AS UNSIGNED) DESC,CAST(citations AS UNSIGNED) DESC,CAST(articlesUdem AS UNSIGNED) DESC LIMIT 0,10',[annee]);

  }


}
