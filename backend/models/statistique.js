const db = require('../util/database');
let SqlString = require('sqlstring'); //global declare
let datetime = require('node-datetime');

module.exports = class Statistique {
  constructor(annee,citations,articlesUdem,JR4COURANT,JR4RETRO,JR3OAGOLD) {
    this.annee = annee;
    this.citations = citations;
    this.articlesUdem=articlesUdem;
    this.JR4COURANT=JR4COURANT;
    this.JR4INTER=JR4INTER;
    this.JR4RETRO=JR4RETRO;
    this.JR3OAGOLD=JR3OAGOLD;
  }


  static fetchAll(idRevue) {
    return db.execute('SELECT * FROM `tbl_statistiques` WHERE `idRevue`=? order by annee Desc',[idRevue]);
  }

  static fetchAllResume(idRevue) {
    return db.execute("SELECT SUM(Total_Item_Requests) as Total_Item_Requests,SUM(No_License) as No_License,SUM(JR3OAGOLD) as JR3OAGOLD,SUM(citations) as citations,SUM(articlesUdem) as articlesUdem, annee, group_concat(plateforme,' ') as plateforme from tbl_statistiques WHERE `idRevue`=? group by annee DESC",[idRevue]);
  }

///Moyenne des téléchargements des 5 dernières années
  static mayenneStatistiques(idRevue) {
    return db.execute("SELECT SUM(Total_Item_Requests)/COUNT(DISTINCT annee) as moyenn_t,SUM(No_License)/COUNT(DISTINCT annee) as moyenn_r,SUM(citations)/COUNT(DISTINCT annee) as moyenn_c,SUM(articlesUdem)/COUNT(DISTINCT annee) as moyenn_a, group_concat(annee,' ') from tbl_statistiques where annee >= year(now()) - 5 and idRevue = ? ",[idRevue]);
  }

  static async post(statistique) {
    //creation de la date
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');
    let idRevue = statistique[statistique.length - 1];
    let idStatistique;

    if(statistique.length==13){
      //delete first element
      statistique.shift();
    }
    idStatistique= await this.validerOperation(idRevue,statistique[0],statistique[1]);
    statistique.push(date);

    if(idStatistique==-1){

      return db.execute('INSERT INTO tbl_statistiques SET annee =?,plateforme=?,Total_Item_Requests =?,No_License =?,citations =?,articlesUdem =?,JR4COURANT =?,JR4INTER =?,JR4RETRO =?,JR3OAGOLD =?,idRevue = ?,dateA =? ', statistique );
    }else {
      statistique.push(idStatistique);
      return db.execute('UPDATE tbl_statistiques SET annee =?,plateforme=?,Total_Item_Requests =?,No_License =?,citations =?,articlesUdem =?,JR4COURANT =?,JR4INTER =?,JR4RETRO =?,JR3OAGOLD =?,idRevue = ?,dateM =? WHERE idStatistique  = ?',
        statistique);
    }

  }

  static update( statistique) {
    //creation de la date
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');
    //afficher la requette
    /*let sql = "UPDATE tbl_statistiques SET annee =?,plateforme=?,Total_Item_Requests =?,No_License =?,citations =?,articlesUdem =?,JR4COURANT =?,JR4INTER =?,JR4RETRO =?,JR3OAGOLD =?,idRevue = ?,dateM =? WHERE idStatistique  = ?"
    console.log('sql: ', SqlString.format(sql,[statistique[1],statistique[2],statistique[3],statistique[4],statistique[5],statistique[6],statistique[7],statistique[8],statistique[9],statistique[10],statistique[11],date, statistique[0]]));*/

    return db.execute('UPDATE tbl_statistiques SET annee =?,plateforme=?,Total_Item_Requests =?,No_License =?,citations =?,articlesUdem =?,JR4COURANT =?,JR4INTER =?,JR4RETRO =?,JR3OAGOLD =?,idRevue = ?,dateM =? WHERE idStatistique  = ?',
      [statistique[1],statistique[2],statistique[3],statistique[4],statistique[5],statistique[6],statistique[7],statistique[8],statistique[9],statistique[10],statistique[11],date, statistique[0]]);
  }

  static delete(idStatistique) {
    return db.execute('DELETE FROM tbl_statistiques WHERE idStatistique  = ?', [idStatistique]);
  }
//recouperer la fiche
  static consulter(idStatistique){
    return db.execute('SELECT * FROM tbl_statistiques WHERE idStatistique  = ?', [idStatistique]);
  }

  //recouperer l'id de la revue
  static async validerOperation(idRevue,annee,PlatformID){
    let result = -1;
    let id=await db.execute("SELECT idStatistique AS id FROM tbl_statistiques WHERE idRevue=? and plateforme=? and annee=? ",[idRevue,PlatformID,annee]);
    if(id[0].length!=0){
      result= id[0]['0']['id']
    }
    return result;
  }

};

