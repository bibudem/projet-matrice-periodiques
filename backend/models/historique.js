const db = require('../util/database');
let SqlString = require('sqlstring'); //global declare
let datetime = require('node-datetime');

module.exports = class Historique {
  constructor(historique,idRevue) {
    this.historique = Historique;
    this.idRevue = idRevue;
  }


  static fetchAll(idRevue) {
    //afficher la requette
    /*let sql = "SELECT * FROM tbl_cores where idRevue = ? order by annee DESC"
    console.log('sql: ', SqlString.format(sql,[idRevue]));*/
    return db.execute('SELECT * FROM tbl_cores where idRevue = ? order by annee DESC',[idRevue]);
  }

  static post(historique) {
    //creation de la date
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');
    //console.log(date);
    //ajouter la date dans le tableau des données
    historique.push(date);
    //afficher la requette
   /*let sql = "INSERT INTO tbl_cores SET core = ?,secteur =?,idRevue = ?,dateA =? "
    console.log('sql: ', SqlString.format(sql,[historique]));*/
    return db.execute('INSERT INTO tbl_cores SET annee = ?,core = ?,secteur =?,idRevue = ?,dateA =? ', historique );
  }

  static update(historique) {
    //creation de la date
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');
    //afficher la requette
   /*let sql = "UPDATE tbl_cores SET idRevue = ?,core = ?,secteur =?,annee = ?,dateM =? WHERE idCore  = ?"
    console.log('sql: ', SqlString.format(sql,[historique[1],historique[2],historique[3],historique[4],date, historique[0]]));*/

    return db.execute('UPDATE tbl_cores SET idRevue = ?,core = ?,secteur =?,annee = ?,dateM =? WHERE idCore  = ?',
      [historique[1],historique[2],historique[3],historique[4],date, historique[0]]);

  }

  static delete(idCore) {
    return db.execute('DELETE FROM tbl_cores WHERE idCore  = ?', [idCore]);
  }
//recouperer la fiche
  static consulter(idCore){
    return db.execute('SELECT * FROM tbl_cores WHERE idCore  = ?', [idCore]);
  }

};

