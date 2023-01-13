const db = require('../util/database');
let SqlString = require('sqlstring'); //global declare
let datetime = require('node-datetime');

module.exports = class Processus {
  constructor() {
      }


  static fetchAll() {
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

  static async postStatistiques(values) {
    //creation de la date
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');
    //ajouter la date dans le tableau des données
    const tabValue = [];
    let condSql = '', condSqlPlateforme = "";
    if(!values[0]){
      return [];
    }
    tabValue['idRevue'] = values[0];
    tabValue['annee'] = values[1];
    tabValue['date'] = date;
    // verifier les champs sur lequels on doit faire la mise a jour
    if(values[2]!='-'){
      condSql += ', Total_Item_Requests = ?';
      tabValue.push(values[2]);
    }
    if(values[3]!='-'){
      condSql += ', Unique_Item_Requests = ?';
      tabValue.push(values[3]);
    }
    if(values[4]!='-'){
      condSql += ', No_License = ?';
      tabValue.push(values[4]);
    }
    if(values[5]!='-'){
      condSql += ', citations = ?';
      tabValue.push(values[5]);
    }
    if(values[6]!='-'){
      condSql += ', articlesUdem = ?';
      tabValue.push(values[6]);
    }
    if(values[7]!='-'){
      condSql += ', JR5COURANT = ?';
      tabValue.push(values[7]);
    }
    if(values[8]!='-'){
      condSql += ', JR5INTER = ?';
      tabValue.push(values[8]);
    }
    if(values[9]!='-'){
      condSql += ', JR5RETRO = ?';
      tabValue.push(values[9]);
    }
    if(values[10]!='-'){
      condSql += ', JR3OAGOLD = ?';
      tabValue.push(values[10]);
    }
    if(values[11]!='-'){
      condSql += ', plateforme = ?';
      condSqlPlateforme += " and plateforme = '"+ values[11].toString() +"'";
      tabValue.push(values[11]);
    }

    // si tous les champs sont '-'
    if(condSql==''){
      return []
    }
    // supprimer ',' du debut de la condition
    condSql = condSql.slice(1);

    /*let sql = 'SELECT COUNT(idStatistique) AS count FROM tbl_statistiques  WHERE idRevue = ? and annee = ? '+ condSqlPlateforme +' '
    console.log('sql-count: ', SqlString.format(sql,[values[0],values[1],values[11]]));*/
    let count= await db.execute('SELECT COUNT(idStatistique) AS count FROM tbl_statistiques  WHERE idRevue = ? and annee = ?  ' + condSqlPlateforme + ' ',[values[0],values[1]])

    //console.log(count[0]['0']['count'])
    if(count[0]['0']['count']>0){
      tabValue.push(date);
      tabValue.push(values[0]);
      tabValue.push(values[1]);
      /*let sql2 = 'UPDATE tbl_statistiques SET ' + condSql + ',dateM =? WHERE idRevue=? and annee=? '
      console.log('sql2: ', SqlString.format(sql2,tabValue));*/
      return   db.execute('UPDATE tbl_statistiques SET ' + condSql + ' ,dateM =? WHERE idRevue=? and annee=?', tabValue );
    }
    condSql += ', annee = ?';
    tabValue.push(values[1]);
    tabValue.push(date);
    tabValue.push(values[0]);

    /*let sql1= 'INSERT INTO tbl_statistiques SET ' + condSql + ',dateA =?,idRevue=?';
     console.log('sql1: ', SqlString.format(sql1,tabValue));*/
    return    db.execute('INSERT INTO tbl_statistiques SET ' + condSql + ',dateA =?,idRevue=?', tabValue );

  }

  static ajoutProcessus(values) {
    let dt = datetime.create();
    let date = dt.format('d/m/Y H:M:S');
    values.push(date);
    /*let sql1= 'INSERT INTO lst_processus SET titre =?,statut =?,admin =?,h_debut =?,h_fin =?';
    console.log('sql1: ', SqlString.format(sql1,[values[0],values[1],values[2],values[3],values[4]]));*/
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
    //console.log('sql: ', SqlString.format(sql,[tabValue['idRevue']]));
    let count= await db.execute("SELECT COUNT(idRevue) AS count FROM tbl_periodiques  WHERE idRevue = ? ",[tabValue['idRevue']])

    //si l'id est trouvé
    if(count[0]['0']['count']>0){
      //si on doit ajouter une note
      if(tabValue['note']!=''){
        await db.execute('INSERT INTO tbl_notes SET idRevue =?,note=?,dateA =?', [tabValue['idRevue'],tabValue['note'],tabValue['date']] );
      }
      let sql = 'UPDATE tbl_periodiques SET abonnement =?,bdd =?,dateM =? WHERE idRevue=? and annee=? '
      //console.log('sql: ', SqlString.format(sql,[tabValue['abonnement'],tabValue['bdd'],tabValue['date'],tabValue['idRevue']]));
      return   db.execute('UPDATE tbl_periodiques SET abonnement =?,bdd =?,dateM =? WHERE idRevue=?', [tabValue['abonnement'],tabValue['bdd'],tabValue['date'],tabValue['idRevue']] );
    }

  }

  static delete(id_processus) {
    return db.execute('DELETE FROM lst_processus WHERE id_processus  = ?', [id_processus]);
  }

};

