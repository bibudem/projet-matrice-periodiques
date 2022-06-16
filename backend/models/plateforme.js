const db = require('../util/database');
let SqlString = require('sqlstring'); //global declare
let datetime = require('node-datetime');

module.exports = class Plateforme {
  constructor(PlatformID,titrePlateforme,note,SUSHIURL,ConsortiumCustID,ConsortiumRequestorID,ConsortiumApiKey,PlatformCode) {
    this.PlatformID = PlatformID;
    this.titrePlateforme = titrePlateforme;
    this.note=note;
    this.SUSHIURL=SUSHIURL;
    this.ConsortiumCustID=ConsortiumCustID;
    this.ConsortiumRequestorID=ConsortiumRequestorID;
    this.ConsortiumApiKey=ConsortiumApiKey;
    this.PlatformCode=PlatformCode;
  }


  static fetchAll() {
    return db.execute('SELECT * FROM `lst_plateformes` order by titrePlateforme ');
  }

  static post(plateforme) {
    //creation de la date
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');
    //console.log(plateforme);
    //ajouter la date dans le tableau des données
    plateforme.push(date);
    //afficher la requette
    /*let sql = "INSERT INTO lst_plateformes SET PlatformID = ?,titrePlateforme =?,note =?,SUSHIURL =?,ConsortiumCustID =?,ConsortiumRequestorID =?,ConsortiumApiKey =?,PlatformCode =?,dateA =? "
    console.log('sql: ', SqlString.format(sql,[plateforme]));*/
    return db.execute('INSERT INTO lst_plateformes SET PlatformID = ?,titrePlateforme =?,note =?,SUSHIURL =?,ConsortiumCustID =?,ConsortiumRequestorID =?,ConsortiumApiKey =?,PlatformCode =?,dateA =? ', plateforme );
  }

  static update(idPlateforme, plateforme) {
    //creation de la date
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');
    //afficher la requette
    /*let sql = "UPDATE lst_plateformes SET PlatformID = ?,titrePlateforme =?,note =?,SUSHIURL =?,ConsortiumCustID =?,ConsortiumRequestorID =?,ConsortiumApiKey =?,PlatformCode =?,dateM =? WHERE idPlateforme  = ?"
    console.log('sql: ', SqlString.format(sql,[plateforme[1],plateforme[2],plateforme[3],plateforme[4],plateforme[5],plateforme[6],plateforme[7],plateforme[8],date, idPlateforme]));*/

    return db.execute('UPDATE lst_plateformes SET PlatformID = ?,titrePlateforme =?,note =?,SUSHIURL =?,ConsortiumCustID =?,ConsortiumRequestorID =?,ConsortiumApiKey =?,PlatformCode =?,dateM =? WHERE idPlateforme  = ?',
      [plateforme[1],plateforme[2],plateforme[3],plateforme[4],plateforme[5],plateforme[6],plateforme[7],plateforme[8],date, idPlateforme]);
  }

  static delete(idPlateforme) {
    return db.execute('DELETE FROM lst_plateformes WHERE idPlateforme  = ?', [idPlateforme]);
  }
//recouperer la fiche
  static consulter(idPlateforme){
    return db.execute('SELECT * FROM lst_plateformes WHERE idPlateforme  = ?', [idPlateforme]);
  }

};

