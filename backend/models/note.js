const db = require('../util/database');
let SqlString = require('sqlstring'); //global declare
let datetime = require('node-datetime');

module.exports = class Note {
  constructor() {
  }


  static fetchAll(idRevue) {
    //afficher la requette
    let sql = "SELECT * FROM tbl_notes where idRevue = ?"
    //console.log('sql: ', SqlString.format(sql,[idRevue]));
    return db.execute('SELECT * FROM tbl_notes where idRevue = ? ',[idRevue]);
  }

  static post(note) {
    //creation de la date
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');
    //console.log(date);
    //ajouter la date dans le tableau des données
    note.push(date);
    //afficher la requette
  /* let sql = "INSERT INTO tbl_notes SET note = ?,courrielAdmin =?,idRevue = ?,dateA =? "
    console.log('sql: ', SqlString.format(sql,[note]));*/
    return db.execute('INSERT INTO tbl_notes SET note = ?,courrielAdmin =?,idRevue = ?,dateA =? ', note );
  }

  static update(note) {
    //creation de la date
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');
    //afficher la requette
    /*let sql = "UPDATE tbl_notes SET idRevue = ?,note = ?,courrielAdmin =?,dateM =? WHERE idNote  = ?"
    console.log('sql: ', SqlString.format(sql,[note[1],note[2],note[3],date, note[0]]));*/

    return db.execute('UPDATE tbl_notes SET idRevue = ?,note = ?,courrielAdmin =?,dateM =? WHERE idNote  = ?',
      [note[1],note[2],note[3],date, note[0]]);

  }

  static delete(idNote) {
    return db.execute('DELETE FROM tbl_notes WHERE idNote  = ?', [idNote]);
  }
//recouperer la fiche
  static consulter(idNote){
    return db.execute('SELECT * FROM tbl_notes WHERE idNote  = ?', [idNote]);
  }

};

