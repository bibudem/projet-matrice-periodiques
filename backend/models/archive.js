const db = require('../util/database');
let SqlString = require('sqlstring'); //global declare
let datetime = require('node-datetime');

module.exports = class Archive {
  constructor(idArchive,idRevue) {
    this.idArchive = idArchive;
    this.idRevue = idRevue;
  }


  static fetchAll(idRevue) {
    //afficher la requette
    let sql = "SELECT * FROM tbl_archives where idRevue = ? order by dateA DESC"
    ///console.log('sql: ', SqlString.format(sql,[idRevue]));
    return db.execute('SELECT * FROM tbl_archives where idRevue = ? ',[idRevue]);
  }

  static post(archive) {
    //creation de la date
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');
    //console.log(date);
    //ajouter la date dans le tableau des données
    archive.push(date);
    //afficher la requette
    /*let sql = "INSERT INTO tbl_archives SET perennite = ?,conserverPap =?,anneeDebut = ?,anneeFin = ?,volDebut =?,embargo = ?,idRevue = ?,dateA =? "
    console.log('sql: ', SqlString.format(sql,[archive]));*/
    return db.execute('INSERT INTO tbl_archives SET perennite = ?,conserverPap =?,anneeDebut = ?,anneeFin = ?,volDebut =?,volFin =?,embargo = ?,idRevue = ?,dateA =? ', archive );
  }

  static update(archive) {
    //creation de la date
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');
    //afficher la requette
    /*let sql = "UPDATE tbl_archives SET idRevue = ?,perennite = ?,conserverPap=?,anneeDebut = ?,anneeFin = ?,volDebut =?,embargo = ?,dateM =? WHERE idArchive  = ?"
    console.log('sql: ', SqlString.format(sql,[archive[1],archive[2],archive[3],archive[4],archive[5],archive[6],archive[7],archive[8],date, archive[0]]));*/

    return db.execute('UPDATE tbl_archives SET idRevue = ?,perennite = ?,conserverPap=?,anneeDebut = ?,anneeFin = ?,volDebut =?,volFin =?,embargo = ?,dateM =? WHERE idArchive  = ?',
      [archive[1],archive[2],archive[3],archive[4],archive[5],archive[6],archive[7],archive[8],date, archive[0]]);

  }

  static delete(idArchive) {
    return db.execute('DELETE FROM tbl_archives WHERE idArchive  = ?', [idArchive]);
  }
//recouperer la fiche
  static consulter(idArchive){
    return db.execute('SELECT * FROM tbl_archives WHERE idArchive  = ?', [idArchive]);
  }

};

