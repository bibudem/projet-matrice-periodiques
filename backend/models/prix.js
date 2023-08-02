const db = require('../util/database');
let SqlString = require('sqlstring'); //global declare
let datetime = require('node-datetime');

module.exports = class Prix {
  constructor(annee,prix,note) {
    this.titre=annee;
    this.note = prix;
    this.idNote = note;
  }


  static fetchAll(idRevue) {
    //afficher la requette
    /*let sql = "SELECT * FROM tbl_prix_periodiques where idRevue = ?"
    console.log('sql: ', SqlString.format(sql,[idRevue]));*/
    return db.execute('SELECT * FROM tbl_prix_periodiques where idRevue = ? order by annee DESC',[idRevue]);
  }

  static post(prix) {
    //creation de la date
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');
   // console.log(date);
    //ajouter la date dans le tableau des données
    prix.push(date);
    //console.log(prix)
    //afficher la requette
    /*let sql = "INSERT INTO tbl_prix_periodiques SET annee = ?,prix =?,devise =?,note =?,idRevue = ?,dateA =? "
    console.log('sql: ', SqlString.format(sql,[prix]));*/
    return db.execute('INSERT INTO tbl_prix_periodiques SET annee = ?,prix =?,devise =?,note =?,idRevue = ?,dateA =? ', prix );
  }

  static update(prix) {
    //creation de la date
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');
    //afficher la requette
    //console.log(prix);
    /*let sql = "UPDATE tbl_prix_periodiques SET idRevue = ?,annee = ?,prix =?,note =?,dateM =? WHERE idPrix  = ?"
    console.log('sql: ', SqlString.format(sql,[prix[7],prix[2],prix[3],prix[4],date, prix[1]]));*/

    return db.execute('UPDATE tbl_prix_periodiques SET idRevue = ?,annee = ?,prix =?,devise =?,note =?,dateM =? WHERE idPrix  = ?',
      [prix[1],prix[2],prix[3],prix[4],prix[5],date, prix[0]]);

  }

  static delete(idPrix) {
    return db.execute('DELETE FROM tbl_prix_periodiques WHERE idPrix  = ?', [idPrix]);
  }

//recouperer la fiche
  static consulter(idPrix){
    return db.execute('SELECT * FROM tbl_prix_periodiques WHERE idPrix  = ?', [idPrix]);
  }

};

