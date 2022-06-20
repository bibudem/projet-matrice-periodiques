const db = require('../util/database');
let SqlString = require('sqlstring'); //global declare
let datetime = require('node-datetime');

module.exports = class Processus {
  constructor() {
      }


  static fetchAll() {
    //afficher la requette
    /*let sql = "SELECT * FROM lst_processus  order by id_processus DESC"
    console.log('sql: ', SqlString.format(sql));*/
    return db.execute('SELECT * FROM lst_processus  order by id_processus DESC');
  }

  static postPrix(prixTableau) {

    return  'OK';
  }

  static postAbonnement(abonnementTableau) {

    return  'OK';
  }

  static delete(id_processus) {
    return db.execute('DELETE FROM lst_processus WHERE id_processus  = ?', [id_processus]);
  }

};

