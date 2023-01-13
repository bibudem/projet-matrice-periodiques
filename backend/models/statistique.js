const db = require('../util/database');
let SqlString = require('sqlstring'); //global declare
let datetime = require('node-datetime');

module.exports = class Statistique {
  constructor(annee,citations,articlesUdem,JR5COURANT,JR5RETRO,JR3OAGOLD) {
    this.annee = annee;
    this.citations = citations;
    this.articlesUdem=articlesUdem;
    this.JR5COURANT=JR5COURANT;
    this.JR5INTER=JR5INTER;
    this.JR5RETRO=JR5RETRO;
    this.JR3OAGOLD=JR3OAGOLD;
  }


  static fetchAll(idRevue) {

    return db.execute('SELECT * FROM `tbl_statistiques` WHERE `idRevue`=? order by annee Desc',[idRevue]);
  }

  static post(statistique) {
    //creation de la date
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');
    //console.log(statistique);
    //ajouter la date dans le tableau des données
    statistique.push(date);
    //afficher la requette
    let sql = "INSERT INTO tbl_statistiques SET annee =?,plateforme=?,Total_Item_Requests =?,Unique_Item_Requests =?,No_License =?,citations =?,articlesUdem =?,JR5COURANT =?,JR5INTER =?,JR5RETRO =?,JR3OAGOLD =?,idRevue = ?,dateA =? "
    console.log('sql: ', SqlString.format(sql,[statistique]));
    return db.execute('INSERT INTO tbl_statistiques SET annee =?,plateforme=?,Total_Item_Requests =?,Unique_Item_Requests =?,No_License =?,citations =?,articlesUdem =?,JR5COURANT =?,JR5INTER =?,JR5RETRO =?,JR3OAGOLD =?,idRevue = ?,dateA =? ', statistique );
  }

  static update( statistique) {
    //creation de la date
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');
    //afficher la requette
    let sql = "UPDATE tbl_statistiques SET annee =?,plateforme=?,Total_Item_Requests =?,Unique_Item_Requests =?,No_License =?,citations =?,articlesUdem =?,JR5COURANT =?,JR5INTER =?,JR5RETRO =?,JR3OAGOLD =?,idRevue = ?,dateM =? WHERE idStatistique  = ?"
    console.log('sql: ', SqlString.format(sql,[statistique[1],statistique[2],statistique[3],statistique[4],statistique[5],statistique[6],statistique[7],statistique[8],statistique[9],statistique[10],statistique[11],statistique[12],date, statistique[0]]));

    return db.execute('UPDATE tbl_statistiques SET annee =?,plateforme=?,Total_Item_Requests =?,Unique_Item_Requests =?,No_License =?,citations =?,articlesUdem =?,JR5COURANT =?,JR5INTER =?,JR5RETRO =?,JR3OAGOLD =?,idRevue = ?,dateM =? WHERE idStatistique  = ?',
      [statistique[1],statistique[2],statistique[3],statistique[4],statistique[5],statistique[6],statistique[7],statistique[8],statistique[9],statistique[10],statistique[11],statistique[12],date, statistique[0]]);
  }

  static delete(idStatistique) {
    return db.execute('DELETE FROM tbl_statistiques WHERE idStatistique  = ?', [idStatistique]);
  }
//recouperer la fiche
  static consulter(idStatistique){
    return db.execute('SELECT * FROM tbl_statistiques WHERE idStatistique  = ?', [idStatistique]);
  }

};

