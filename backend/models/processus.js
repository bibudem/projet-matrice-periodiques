const db = require('../util/database');
let SqlString = require('sqlstring'); //global declare
let datetime = require('node-datetime');
if (typeof localStorage === "undefined" || localStorage === null) {
  let LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}


module.exports = class Processus {


  constructor() {}



  static fetchAll() {
    return db.execute('SELECT * FROM lst_processus  order by id_processus DESC');
  }

  static getAllDetailsProcessus(id) {
    return db.execute('SELECT id_details,lst_processus_details.id_processus as id_processus, lst_processus_details.idRevue as idRevue,lst_processus_details.ISSN as ISSN,lst_processus_details.EISSN as EISSN, titre, lst_processus_details.dateA as dateA FROM lst_processus_details Left JOIN tbl_periodiques on lst_processus_details.idRevue=tbl_periodiques.idRevue where id_processus = ? order by id_details DESC',[id]);
  }

  static getLastIdProcessus() {
    return db.execute("SELECT MAX(id_processus) AS max FROM lst_processus  ");
  }

  static async postPrix(values) {
    //creation de la date
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');
    //console.log(values);
    if(values[0]=='-' && values[1]=='-' && values[2]=='-'){
      return [];
    }
    //ajouter la date dans le tableau des données
    const tabValue = [];
    tabValue['idRevue'] = values[0];
    tabValue['ISSN'] = values[1];
    tabValue['EISSN'] = values[2];
    tabValue['annee'] = values[3];
    tabValue['prix'] = values[4];
    tabValue['note'] = values[5];
    tabValue['idProcessus'] = Number(values[6])+1;
    tabValue['date'] = date;

    //chercher l'id du revue
    if(values[0]=='-'){
      let idRevue= await db.execute("SELECT idRevue as id  FROM tbl_periodiques  WHERE  (ISSN = ? AND EISSN =?) or (EISSN = ? AND ISSN =?) LIMIT 0,1",[tabValue['ISSN'],tabValue['EISSN'],tabValue['ISSN'],tabValue['EISSN']]);

      tabValue['idRevue']=idRevue[0]['0']['id'];
    }

        let prixAnnee= await db.execute("SELECT Count(idRevue) as count  FROM tbl_prix_periodiques  WHERE idRevue = ? and  annee=?",[tabValue['idRevue'],tabValue['annee']]);
         //console.log(prixAnnee[0]['0']['count']);

        /** Ajout details processus*/
        await db.execute('INSERT INTO lst_processus_details SET idRevue =?,ISSN=?, EISSN=?,id_processus=?,dateA =?', [tabValue['idRevue'],tabValue['ISSN'],tabValue['EISSN'],tabValue['idProcessus'],date] );


        if(prixAnnee[0]['0']['count']==0){
          return   db.execute('INSERT INTO tbl_prix_periodiques SET prix = ?,note = ?,dateA = ?,annee= ? ,idRevue= ?', [tabValue['prix'],tabValue['note'],tabValue['date'],tabValue['annee'],tabValue['idRevue']] );
         }
        else {
          return   db.execute('UPDATE tbl_prix_periodiques SET prix =?,note =?,dateM =? WHERE idRevue=? and annee=?', [tabValue['prix'],tabValue['note'],tabValue['date'],tabValue['idRevue'],tabValue['annee']] );
        }
  }

  static async postStatistiques(values) {
    //creation de la date
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');
    //ajouter la date dans le tableau des données
    const tabValue = [];
    let condSql = '', condSqlPlateforme = "";

    tabValue['idRevue'] = values[0];
    //chercher l'id du revue
    if(values[0]=='-'){
      let idRevue= await db.execute("SELECT idRevue as id  FROM tbl_periodiques  WHERE  (ISSN = ? AND EISSN =?) or (EISSN = ? AND ISSN =?) LIMIT 0,1",[values[1],values[2],values[1],values[2]]);

       tabValue['idRevue']=idRevue[0]['0']['id'];
    }

    tabValue['annee'] = values[3];
    tabValue['date'] = date;
    if(values[4]!='-'){
      condSql += ', Total_Item_Requests = ?';
      tabValue.push(values[4]);
    }
    if(values[5]!='-'){
      condSql += ', Unique_Item_Requests = ?';
      tabValue.push(values[5]);
    }
    if(values[6]!='-'){
      condSql += ', No_License = ?';
      tabValue.push(values[6]);
    }
    if(values[7]!='-'){
      condSql += ', citations = ?';
      tabValue.push(values[7]);
    }
    if(values[8]!='-'){
      condSql += ', articlesUdem = ?';
      tabValue.push(values[8]);
    }
    if(values[9]!='-'){
      condSql += ', JR5COURANT = ?';
      tabValue.push(values[9]);
    }
    if(values[10]!='-'){
      condSql += ', JR5INTER = ?';
      tabValue.push(values[10]);
    }
    if(values[11]!='-'){
      condSql += ', JR5RETRO = ?';
      tabValue.push(values[11]);
    }
    if(values[12]!='-'){
      condSql += ', JR3OAGOLD = ?';
      tabValue.push(values[12]);
    }
    if(values[13]!='-'){
      condSql += ', plateforme = ?';
      condSqlPlateforme += " and plateforme = '"+ values[13].toString() +"'";
      tabValue.push(values[13]);
    }

    tabValue['idProcessus'] = Number(values[14])+1;

    // si tous les champs sont '-'
    if(condSql==''){
      return []
    }

    // supprimer ',' du debut de la condition
    condSql = condSql.slice(1);

    //console.log(tabValue)
    let count= await db.execute('SELECT COUNT(idStatistique) AS count FROM tbl_statistiques  WHERE idRevue = ? and annee = ?  ' + condSqlPlateforme + ' ',[tabValue['idRevue'],tabValue['annee']])
    /** Ajout details processus*/
    await db.execute('INSERT INTO lst_processus_details SET idRevue =?,id_processus=?,ISSN = ?,EISSN =?,dateA =?', [tabValue['idRevue'],tabValue['idProcessus'],values[1],values[2],date] );


    if(count[0]['0']['count']>0){
      tabValue.push(date);
      tabValue.push(tabValue['idRevue']);
      tabValue.push(tabValue['annee']);
      /*let sql1= 'UPDATE tbl_statistiques SET ' + condSql + ' ,dateM =? WHERE idRevue=? and annee=?';
      console.log('sql1: ', SqlString.format(sql1,tabValue));*/
      return   db.execute('UPDATE tbl_statistiques SET ' + condSql + ' ,dateM =? WHERE idRevue=? and annee=?', tabValue );
    }
    condSql += ', annee = ?';
    tabValue.push(tabValue['annee']);
    tabValue.push(date);
    tabValue.push(tabValue['idRevue']);

     /*let sql1= 'INSERT INTO tbl_statistiques SET ' + condSql + ',dateA =?,idRevue=?';
     console.log('sql1: ', SqlString.format(sql1,tabValue));*/
    return    db.execute('INSERT INTO tbl_statistiques SET ' + condSql + ',dateA =?,idRevue=?', tabValue );

  }
// procedure pour la mise a jour manuellement des periodique
  static async postPeriodiques(values) {
    //creation de la date
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');
    //ajouter la date dans le tableau des données
    //console.log(values);
    const tabValue = [];
    let condSql = '';
    tabValue['idRevue'] = values[0];
    //chercher l'id du revue
    if(tabValue['idRevue']=='-'){
      let idRevue= await db.execute("SELECT idRevue as id  FROM tbl_periodiques  WHERE  (ISSN = ? AND EISSN =?) or (EISSN = ? AND ISSN =?) LIMIT 0,1",[values[2],values[3],values[2],values[3]]);

      tabValue['idRevue']=idRevue[0]['0']['id'];
    }
    // verifier les champs sur lequels on doit faire la mise a jour
    if(values[1]!='-'){
      condSql += ', titre = ?';
      tabValue.push(values[1]);
    }
    if(values[2]!='-'){
      condSql += ', ISSN = ?';
      tabValue.push(values[2]);
    }
    if(values[3]!='-'){
      condSql += ', EISSN = ?';
      tabValue.push(values[3]);
    }
    if(values[4]!='-'){
      condSql += ', statut = ?';
      tabValue.push(values[4]);
    }
    if(values[5]!='-'){
      condSql += ', abonnement = ?';
      tabValue.push(values[5]);
    }
    if(values[6]!='-'){
      condSql += ', bdd = ?';
      tabValue.push(values[6]);
    }
    if(values[7]!='-'){
      condSql += ', fonds = ?';
      tabValue.push(values[7]);
    }
    if(values[8]!='-'){
      condSql += ', fournisseur = ?';
      tabValue.push(values[8]);
    }
    //Chercher l'id de la plateforme
    if(values[9]!='-'){
      let plateformePrincipale= await db.execute('SELECT idPlateforme AS id FROM lst_plateformes  WHERE titrePlateforme = ? or PlatformID = ? ',[values[9],values[9]]);
        plateformePrincipale = plateformePrincipale[0]['0']['id'].toString();

        if(plateformePrincipale){
          tabValue.push(plateformePrincipale);
          condSql += ', plateformePrincipale = ?';
        }

    }
    //Chercher les id des autres plateforme
    if(values[10]!='-'){
      let listPl = values[10].split(",");
      let listId ='', idP;
        for(let i=0;i<listPl.length;i++){
          /*let sqlP = 'SELECT idPlateforme AS id FROM lst_plateformes  WHERE titrePlateforme = ? or PlatformID = ? '
          console.log('sql-count: ', SqlString.format(sqlP,[listPl[i],listPl[i]]));*/
          idP = await db.execute('SELECT idPlateforme AS id FROM lst_plateformes  WHERE titrePlateforme = ? or PlatformID = ? ',[listPl[i],listPl[i]]);
          if(idP){
            listId+=idP[0]['0']['id']+',';
          }
        }
      if(listId!='')  {
        tabValue.push(listId);
        condSql += ', autrePlateforme = ?';
      }


    }
    if(values[11]!='-'){
      condSql += ', format = ?';
      tabValue.push(values[11]);
    }
    if(values[12]!='-'){
      condSql += ', libreAcces = ?';
      tabValue.push(values[12]);
    }
    if(values[13]!='-'){
      condSql += ', domaine = ?';
      tabValue.push(values[13]);
    }
    if(values[14]!='-'){
      condSql += ', secteur = ?';
      tabValue.push(values[14]);
    }
    if(values[15]!='-'){
      condSql += ', sujets = ?';
      tabValue.push(values[15]);
    }
    if(values[16]!='-'){
      condSql += ', duplication = ?';
      tabValue.push(values[16]);
    }
    if(values[17]!='-'){
      condSql += ', duplicationCourant = ?';
      tabValue.push(values[17]);
    }
    if(values[18]!='-'){
      condSql += ', duplicationEmbargo1 = ?';
      tabValue.push(values[18]);
    }
    if(values[19]!='-'){
      condSql += ', duplicationEmbargo2 = ?';
      tabValue.push(values[19]);
    }
    if(values[20]!='-'){
      condSql += ', essentiel2014 = ?';
      tabValue.push(values[20]);
    }
    if(values[21]!='-'){
      condSql += ', essentiel2022 = ?';
      tabValue.push(values[21]);
    }
    tabValue['idProcessus'] = Number(values[22])+1;

    // si tous les champs sont '-'
    if(condSql==''){
      return []
    }
    // supprimer ',' du debut de la condition
    condSql = condSql.slice(1);
    tabValue.push(date);
    tabValue.push(tabValue['idRevue']);

    /** Ajout details processus*/
    await db.execute('INSERT INTO lst_processus_details SET idRevue =?,id_processus=?,ISSN=?,EISSN=?,dateA =?', [tabValue['idRevue'],tabValue['idProcessus'],values[2],values[3],date] );

    /*let sql = 'SELECT COUNT(idRevue) AS count FROM tbl_periodiques  WHERE idRevue = ?'
    console.log('sql-count: ', SqlString.format(sql,[values[0]]));*/
    let count= await db.execute('SELECT COUNT(idRevue) AS count FROM tbl_periodiques  WHERE idRevue = ?  ',[tabValue['idRevue']])


    if(count[0]['0']['count']>0){
      /*let sql2 = 'UPDATE tbl_periodiques SET ' + condSql + ',dateM =? WHERE idRevue=? '
      console.log('sql2: ', SqlString.format(sql2,tabValue));*/
      return   db.execute('UPDATE tbl_periodiques SET ' + condSql + ' ,dateM =? WHERE idRevue=? ', tabValue );
    }


    tabValue.pop();
    tabValue.push(null)
    /*let sql1= 'INSERT INTO tbl_periodiques SET ' + condSql + ',dateA =?,idRevue=?';
     console.log('sql1: ', SqlString.format(sql1,tabValue));*/
    return    db.execute('INSERT INTO tbl_periodiques SET ' + condSql + ',dateA =?,idRevue=?', tabValue);

  }

  static async postAbonnement(values) {
    //creation de la date
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');
    //ajouter la date dans le tableau des données
    const tabValue = [];
    const updateValues=[];
    let condSql = '';

    if(values[0]=='-' & values[1]=='-' & values[2]=='-'){
      return [];
    }
    tabValue['idRevue'] = values[0];
    tabValue['ISSN'] = values[1];
    tabValue['EISSN'] = values[2];

    if(values[3]!='-'){
      condSql += ', abonnement =? ';
      updateValues.push(values[3]);
    }
    if(values[4]!='-'){
      condSql += ', bdd =?';
      updateValues.push(values[4]);
    }
    // supprimer ',' du debut de la condition
    condSql = condSql.slice(1);
    tabValue['note'] = values[5];
    tabValue['idProcessus'] = Number(values[6])+1;
    tabValue['date'] = date;
    updateValues.push(date);
    //console.log(values)
    /*let sql = 'SELECT idRevue  FROM tbl_periodiques  WHERE idRevue = ? or (ISSN = ? AND EISSN =?) or (EISSN = ? AND ISSN =?)'
    console.log('sql: ', SqlString.format(sql,[tabValue['idRevue'],tabValue['ISSN'],tabValue['EISSN'],tabValue['ISSN'],tabValue['EISSN']]));*/
    let id= await db.execute("SELECT idRevue as id  FROM tbl_periodiques  WHERE idRevue = ? or (ISSN = ? AND EISSN =?) or (EISSN = ? AND ISSN =?)",[tabValue['idRevue'],tabValue['ISSN'],tabValue['EISSN'],tabValue['ISSN'],tabValue['EISSN']]);

    let idRevue=id[0]['0']['id'];

    tabValue['idRevue'] = idRevue;
    updateValues.push(idRevue);
    /** Ajout details processus*/
    /*let sql1= 'INSERT INTO lst_processus_details SET idRevue =?,ISSN =?, EISSN =?,id_processus=?,dateA =?';
    console.log('sql1: ', SqlString.format(sql1,[tabValue['idRevue'],tabValue['ISSN'],tabValue['EISSN'],tabValue['idProcessus'],date]));*/
    await db.execute('INSERT INTO lst_processus_details SET idRevue =?,ISSN =?, EISSN =?,id_processus=?,dateA =?', [tabValue['idRevue'],tabValue['ISSN'],tabValue['EISSN'],tabValue['idProcessus'],date] );

    //si l'id est trouvé
    if(idRevue!=null){
        tabValue['idRevue'] = idRevue;
        //si on doit ajouter une note
        if(tabValue['note']!='-'){
          await db.execute('INSERT INTO tbl_notes SET idRevue =?,note=?,dateA =?', [idRevue ,tabValue['note'],tabValue['date']] );
        }
        return db.execute('UPDATE tbl_periodiques SET ' + condSql + ' ,dateM =? WHERE idRevue=?', updateValues );
      }
    else {
      return []
    }
  }

  static delete(id) {
    return db.execute('DELETE FROM lst_processus WHERE id_processus  = ?', [id]);
  }

  static deleteProcessusDetails(id) {
    return db.execute('DELETE FROM lst_processus_details WHERE id_details  = ?', [id]);
  }


  static async ajoutProcessus(values) {
    let dt = datetime.create();
    let date = dt.format('d/m/Y H:M:S');
    let statut = 'Terminé';
    values.push(date);
    let sql1= 'INSERT INTO lst_processus SET titre =?,statut =?,admin =?,h_debut =?,h_fin =?';
    console.log('sql1: ', SqlString.format(sql1,[values[0],statut,values[1],values[2],date]));
    return db.execute('INSERT INTO lst_processus SET titre =?,type =?,statut =?,admin =?,h_debut =?,h_fin =? ', [values[0],values[1],statut,values[2],values[3],date] );
  }

};

