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

  static async postPrix(values) {
    //creation de la date
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');
    //ajouter la date dans le tableau des données
    const tabValue = [];
    tabValue['idRevue'] = values[0];
    tabValue['annee'] = values[1];
    tabValue['prix'] = values[2];
    tabValue['note'] = values[3];
    tabValue['date'] = date;

    //console.log(tabValue)
    /*let sql = 'SELECT COUNT(idPrix) AS count FROM tbl_prix_periodiques  WHERE idRevue = ? and annee = ? '
    console.log('sql: ', SqlString.format(sql,[tabValue['idRevue'],tabValue['annee']]));*/
    let count= await db.execute("SELECT COUNT(idPrix) AS count FROM tbl_prix_periodiques  WHERE idRevue = ? and annee = ? ",[tabValue['idRevue'],tabValue['annee']])

    //console.log(count[0]['0']['count'])
    if(count[0]['0']['count']>0){
      /*let sql = 'UPDATE tbl_prix_periodiques SET prix =?,note =?,dateM =? WHERE idRevue=? and annee=? '
      console.log('sql: ', SqlString.format(sql,[tabValue['prix'],tabValue['note'],tabValue['date'],tabValue['idRevue'],tabValue['annee']]));*/
      return   db.execute('UPDATE tbl_prix_periodiques SET prix =?,note =?,dateM =? WHERE idRevue=? and annee=?', [tabValue['prix'],tabValue['note'],tabValue['date'],tabValue['idRevue'],tabValue['annee']] );
    }
      /*let sql1= 'INSERT INTO tbl_prix_periodiques SET prix =?,annee=?,note =?,dateA =?,idRevue=?';
    console.log('sql1: ', SqlString.format(sql1,[tabValue['prix'],tabValue['annee'],tabValue['note'],tabValue['date'],tabValue['idRevue']]));*/
    return   db.execute('INSERT INTO tbl_prix_periodiques SET prix =?,annee=?,note =?,dateA =?,idRevue=?', [tabValue['prix'],tabValue['annee'],tabValue['note'],tabValue['date'],tabValue['idRevue']] );

  }

  static ajoutProcessus(values) {
    let dt = datetime.create();
    let date = dt.format('d/m/Y H:M:S');
    values.push(date);
    let sql1= 'INSERT INTO lst_processus SET titre =?,statut =?,admin =?,h_debut =?,h_fin =?';
    console.log('sql1: ', SqlString.format(sql1,[values[0],values[1],values[2],values[3],values[4]]));
    return db.execute('INSERT INTO lst_processus SET titre =?,statut =?,admin =?,h_debut =?,h_fin =? ', [values[0],values[1],values[2],values[3],values[4]] );
  }

  static async postAbonnement(values) {
    //creation de la date
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');
    //ajouter la date dans le tableau des données
    const tabValue = [];
    tabValue['idRevue'] = values[0];
    tabValue['abonnement'] = values[1];
    tabValue['bdd'] = values[2];
    tabValue['note'] = values[3];
    tabValue['date'] = date;

    //console.log(tabValue)
    let sql = 'SELECT COUNT(idRevue) AS count FROM tbl_periodiques  WHERE idRevue = ?'
    console.log('sql: ', SqlString.format(sql,[tabValue['idRevue']]));
    let count= await db.execute("SELECT COUNT(idRevue) AS count FROM tbl_periodiques  WHERE idRevue = ? ",[tabValue['idRevue']])

    //si l'id est trouvé
    if(count[0]['0']['count']>0){
      //si on doit ajouter une note
      if(tabValue['note']!=''){
        await db.execute('INSERT INTO tbl_notes SET idRevue =?,note=?,dateA =?', [tabValue['idRevue'],tabValue['note'],tabValue['date']] );
      }
      let sql = 'UPDATE tbl_periodiques SET abonnement =?,bdd =?,dateM =? WHERE idRevue=? and annee=? '
      console.log('sql: ', SqlString.format(sql,[tabValue['abonnement'],tabValue['bdd'],tabValue['date'],tabValue['idRevue']]));
      return   db.execute('UPDATE tbl_periodiques SET abonnement =?,bdd =?,dateM =? WHERE idRevue=?', [tabValue['abonnement'],tabValue['bdd'],tabValue['date'],tabValue['idRevue']] );
    }

  }

  static delete(id_processus) {
    return db.execute('DELETE FROM lst_processus WHERE id_processus  = ?', [id_processus]);
  }

};

