const db = require('../util/database');
let SqlString = require('sqlstring'); //global declare
let datetime = require('node-datetime');

module.exports = class Logs {
  constructor() {

  }


  static fetchAllLogsRevue(annee) {
    /*let sql = "SELECT * FROM lst_logsrevues  where annee=? order by Title"
    console.log('sql: ', SqlString.format(sql,[annee]));*/

    return db.execute('SELECT * FROM lst_logsrevues  where annee=? order by Title',[annee]);
  }

  static fetchAllLogsPlateforme() {

    return db.execute('SELECT * FROM lst_logsplateformes order by plateforme');
  }

  static async fetchCount() {
    let totalLogsRevue,totalLogsPlat
    let count1= await  db.execute('SELECT COUNT(id_log) as count FROM lst_logsrevues ');
    totalLogsRevue=count1[0]['0'].count

    let count2= await  db.execute('SELECT COUNT(idLog) as count FROM lst_logsplateformes ');
    totalLogsPlat=count2[0]['0'].count
    //console.log(totalLogsRevue)
    //console.log(totalLogsPlat)
    let count={'totalLogsRevue':totalLogsRevue,'totalLogsPlat':totalLogsPlat}

    return[count]
  }

  static async deleteLogsRevue(id) {

    return db.execute('DELETE FROM lst_logsrevues WHERE id_log=?',[id]);

  }

  static async deleteLogsPLateforme(id) {
    /*let sql = "DELETE FROM lst_logsplateformes WHERE idLog=?"
    console.log('sql: ', SqlString.format(sql,[id]));*/

    return db.execute('DELETE FROM lst_logsplateformes WHERE idLog=?',[id]);

  }

}
