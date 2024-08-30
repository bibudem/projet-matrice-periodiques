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
    return db.execute("SELECT lst_processus.id_processus as idP, titre,annee,admin,statut,h_debut,h_fin,note, ( SELECT  GROUP_CONCAT(DISTINCT plateforme ,' ' ) FROM  lst_processus_details where id_processus=idP) AS plateforme FROM lst_processus  order by id_processus DESC ");
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
    if(values[0]=='-' && values[1]=='-' && values[2]=='-'){
      return [];
    }
    //si non valid idRevue
    if(values[0]!='-' ){
      let valid= await this.valideIdRevue(values[0]);
      if(!valid){
        await this.ajoutProcessusDetails(values[0],'-1','','')
        return []
      }
    }
    //ajouter la date dans le tableau des données
    const tabValue = [];
    tabValue['idRevue'] = values[0];
    tabValue['ISSN'] = values[1];
    tabValue['EISSN'] = values[2];
    tabValue['annee'] = values[3];
    tabValue['prix'] = values[4];
    tabValue['note'] = values[5];
    tabValue['date'] = date;

    //chercher l'id du revue
    if(values[0]=='-'){
      tabValue['idRevue']=await this.matchIdRevue(tabValue['ISSN'],tabValue['EISSN'],'autre');
    }
    //si non match
    if(tabValue['idRevue']=='-1'){
      return []
    }

    let prixAnnee= await db.execute("SELECT Count(idRevue) as count  FROM tbl_prix_periodiques  WHERE idRevue = ? and  annee=?",[tabValue['idRevue'],tabValue['annee']]);

    if(prixAnnee[0]['0']['count']==0){
      await db.execute('INSERT INTO tbl_prix_periodiques SET prix = ?,note = ?,dateA = ?,annee= ? ,idRevue= ?', [tabValue['prix'],tabValue['note'],tabValue['date'],tabValue['annee'],tabValue['idRevue']] );
    }
    else {
      await db.execute('UPDATE tbl_prix_periodiques SET prix =?,note =?,dateM =? WHERE idRevue=? and annee=?', [tabValue['prix'],tabValue['note'],tabValue['date'],tabValue['idRevue'],tabValue['annee']] );
    }
    /** Ajout details processus*/
    await this.ajoutProcessusDetails(tabValue['idRevue'],tabValue['ISSN'],tabValue['EISSN'],'');
  }

  static async postArchives(values) {
    //creation de la date
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');
    if(values[0]=='-' && values[1]=='-' && values[2]=='-'){
      return [];
    }
    //si non valid idRevue
    if(values[0]!='-' ){
      let valid= await this.valideIdRevue(values[0]);
      if(!valid){
        await this.ajoutProcessusDetails(values[0],'-1','','')
        return []
      }
    }
    //ajouter la date dans le tableau des données
    const tabValue = [];
    tabValue['idRevue'] = values[0];
    tabValue['ISSN'] = values[1];
    tabValue['EISSN'] = values[2];
    tabValue['perennite'] = values[3];
    tabValue['conserverPap'] = values[4];
    tabValue['anneeDebut'] = values[5];
    tabValue['anneeFin'] = values[6];
    tabValue['volDebut'] = values[7];
    tabValue['volFin'] = values[8];
    tabValue['embargo'] = values[9];
    tabValue['fournisseur'] = values[10];
    tabValue['date'] = date;

    //chercher l'id du revue
    if(values[0]=='-'){
      tabValue['idRevue']=await this.matchIdRevue(tabValue['ISSN'],tabValue['EISSN'],'autre');
    }
    //si non match
    if(tabValue['idRevue']=='-1'){
      return []
    }

    let archives= await db.execute("SELECT Count(idRevue) as count  FROM tbl_archives  WHERE idRevue = ? and  anneeDebut=? and anneeFin=?",[tabValue['idRevue'],tabValue['anneeDebut'],tabValue['anneeFin']]);
    //console.log(prixAnnee[0]['0']['count']);
    if(archives[0]['0']['count']==0){
      /*let sql1= 'INSERT INTO tbl_archives SET idRevue = ?,perennite = ?,conserverPap = ?,anneeDebut= ? ,anneeFin= ?,volDebut= ?,volFin= ?,embargo= ?,fournisseur= ?,dateA=?';
      console.log('sql1: ', SqlString.format(sql1,[tabValue['idRevue'],tabValue['perennite'],tabValue['conserverPap'],tabValue['anneeDebut'],tabValue['anneeFin'],tabValue['volDebut'],tabValue['volFin'],tabValue['embargo'],tabValue['fournisseur'],tabValue['date']]));*/
      await db.execute('INSERT INTO tbl_archives SET idRevue = ?,perennite = ?,conserverPap = ?,anneeDebut= ? ,anneeFin= ?,volDebut= ?,volFin= ?,embargo= ?,fournisseur= ?,dateA=?', [tabValue['idRevue'],tabValue['perennite'],tabValue['conserverPap'],tabValue['anneeDebut'],tabValue['anneeFin'],tabValue['volDebut'],tabValue['volFin'],tabValue['embargo'],tabValue['fournisseur'],tabValue['date']] );
    }
    else {
      await db.execute('UPDATE tbl_archives SET perennite =?,conserverPap =?,volDebut =?,volFin =?,embargo =?,fournisseur =?,dateM =? WHERE idRevue=? and anneeDebut=? and anneeFin=?', [tabValue['perennite'],tabValue['conserverPap'],tabValue['volDebut'],tabValue['volFin'],tabValue['embargo'],tabValue['fournisseur'],tabValue['date'],tabValue['idRevue'],tabValue['anneeDebut'],tabValue['anneeFin']] );
    }
    /** Ajout details processus*/
    await this.ajoutProcessusDetails(tabValue['idRevue'],tabValue['ISSN'],tabValue['EISSN'],'');
  }

  static async postStatistiques(values) {
    try {
      // Création de la date
      let dt = datetime.create();
      let date = dt.format('Y-m-d H:M:S');

      // Ajouter la date dans le tableau des données
      const tabValue = {
        idRevue: values[0],
        ISSN: values[1],
        EISSN: values[2],
        annee: values[3],
        date: date,
        Total_Item_Requests: values[4],
        No_License: values[5],
        citations: values[6],
        articlesUdem: values[7],
        JR4COURANT: values[8],
        JR4INTER: values[9],
        JR4RETRO: values[10],
        JR3OAGOLD: values[11],
        plateforme: values[12] !== '-' ? values[12] : ''
      };

      // Vérifier si l'idRevue est valide
      if (values[0] !== '-') {
        let valid = await this.valideIdRevue(values[0]);
        if (!valid) {
          await this.ajoutProcessusDetails(values[0], '-1', tabValue.EISSN, tabValue.plateforme);
          return [];
        }
      }

      // Chercher l'id du revue s'il n'est pas spécifié
      if (values[0] === '-') {
        tabValue.idRevue = await this.matchIdRevue(tabValue.ISSN, tabValue.EISSN, 'autre');
      }

      // Vérifier si l'id du revue n'a pas été trouvé
      if (tabValue.idRevue === '-1') {
        return [];
      }

      // Si tous les champs sont '-'
      if (tabValue.Total_Item_Requests === '-' && tabValue.No_License === '-' && tabValue.citations === '-' && tabValue.articlesUdem === '-' && tabValue.JR4COURANT === '-' && tabValue.JR4INTER === '-' && tabValue.JR4RETRO === '-' && tabValue.JR3OAGOLD === '-' && tabValue.plateforme === '') {
        return [];
      }

      let count = {};
      if (tabValue.plateforme !== '-') {
        count = await db.execute('SELECT COUNT(idStatistique) AS count FROM tbl_statistiques WHERE idRevue = ? AND annee = ? AND plateforme = ?', [tabValue.idRevue, tabValue.annee, tabValue.plateforme]);
      } else {
        count = await db.execute('SELECT COUNT(idStatistique) AS count FROM tbl_statistiques WHERE idRevue = ? AND annee = ?', [tabValue.idRevue, tabValue.annee]);
      }

      if (count[0]['0']['count'] > 0) {
        tabValue.dateM = date;
        let valuesUpdate = [];
        let updateColumns = Object.keys(tabValue)
          .map(key => {
            if (key !== 'ISSN' && key !== 'EISSN' && key !== 'date' && key !== 'idRevue' && key !== 'annee') {
              if (tabValue[key] !== '-') {
                valuesUpdate.push(tabValue[key]);
                return `${key} = ?`;
              }
            }
          })
          .filter(Boolean)
          .join(', ');

        valuesUpdate.push(tabValue.idRevue);
        valuesUpdate.push(tabValue.annee);

        await db.execute('UPDATE tbl_statistiques SET ' + updateColumns + ' WHERE idRevue=? and annee=?', valuesUpdate);

      } else {
        tabValue.dateA = date;
        let valuesInsert = [];
        let insertColumns = Object.keys(tabValue)
          .map(key => {
            if (key !== 'ISSN' && key !== 'EISSN' && key !== 'date' && key !== 'idRevue' && key !== 'annee') {
              if (tabValue[key] !== '-') {
                valuesInsert.push(tabValue[key]);
                return `${key} = ?`;
              }
            }
          })
          .filter(Boolean)
          .join(', ');

        valuesInsert.push(tabValue.idRevue);
        valuesInsert.push(tabValue.annee);

        await db.execute('INSERT INTO tbl_statistiques SET ' + insertColumns + ', idRevue=?, annee=?', valuesInsert);
      }

      return await this.ajoutProcessusDetails(tabValue.idRevue, tabValue.ISSN, tabValue.EISSN, tabValue.plateforme);
    } catch (error) {
      console.error("Error in postStatistiques:", error);
      throw error;
    }
  }


// procedure pour la mise a jour manuellement des periodique
  static async postPeriodiques(values) {
    //creation de la date
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');
    //ajouter la date dans le tableau des données
    const tabValue = [];
    let condSql = '';
    if(values[0]=='-' && values[2]=='-' && values[3]=='-'){
      return [];
    }
    tabValue['idRevue'] = values[0];
    tabValue['ISSN'] = values[2];
    tabValue['EISSN'] = values[3];

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

    // si tous les champs sont '-'
    if(condSql==''){
      return []
    }
    // supprimer ',' du debut de la condition
    condSql = condSql.slice(1);
    tabValue.push(date);
    tabValue.push(tabValue['idRevue']);


    //si non valid idRevue
    if(tabValue['idRevue']!='-' ){
      let valid= await this.valideIdRevue(values[0]);
      if(valid){
        await  db.execute('UPDATE tbl_periodiques SET ' + condSql + ' ,dateM =? WHERE idRevue=? ', tabValue );
      }
    }
    if(tabValue['idRevue']=='-'){
      tabValue['idRevue']=await this.matchIdRevue(tabValue['ISSN'],tabValue['EISSN'],'fiche');
      //si non match ajouter une nouvelle fiche
      if(tabValue['idRevue']=='-1'){
        tabValue.pop();
        tabValue.push(null)
        /*let sql1= 'INSERT INTO tbl_periodiques SET ' + condSql + ',dateA =?,idRevue=?';
        console.log('sql1: ', SqlString.format(sql1,tabValue));*/
        await db.execute('INSERT INTO tbl_periodiques SET ' + condSql + ',dateA =?,idRevue=?', tabValue);
        let lastId= await db.execute('SELECT MAX(idRevue) as idRevue FROM tbl_periodiques');
        tabValue['idRevue']=lastId[0]['0']['idRevue'];
      } else {
        await  db.execute('UPDATE tbl_periodiques SET ' + condSql + ' ,dateM =? WHERE idRevue=? ', tabValue );
      }

    }

    /** Ajout details processus*/
    return await this.ajoutProcessusDetails(tabValue['idRevue'],tabValue['ISSN'],tabValue['EISSN'],'');
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

    //si non valid idRevue
    if(values[0]!='-' ){
      let valid= await this.valideIdRevue(values[0]);
      if(!valid){
        await this.ajoutProcessusDetails(values[0],'-1','','')
        return []
      }
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
    tabValue['date'] = date;
    updateValues.push(date);
    //chercher l'id du revue
    if(values[0]=='-'){
      tabValue['idRevue']=await this.matchIdRevue(tabValue['ISSN'],tabValue['EISSN'],'autre');
    }
    //si non match
    if(tabValue['idRevue']=='-1'){
      return []
    }
    updateValues.push(tabValue['idRevue']);
    //console.log(tabValue)

    //si on doit ajouter une note
    if(tabValue['note']!='-'){
      await db.execute('INSERT INTO tbl_notes SET idRevue =?,note=?,dateA =?', [tabValue['idRevue'] ,tabValue['note'],tabValue['date']] );
    }

    await db.execute('UPDATE tbl_periodiques SET ' + condSql + ' ,dateM =? WHERE idRevue=?', updateValues );

    /** Ajout details processus*/
    return await this.ajoutProcessusDetails(tabValue['idRevue'],tabValue['ISSN'],tabValue['EISSN'],'');

  }

  static delete(id) {
    return db.execute('DELETE FROM lst_processus WHERE id_processus  = ?', [id]);
  }

  static deleteProcessusDetails(id) {

    return db.execute('DELETE FROM lst_processus_details WHERE id_details  = ?', [id]);
  }


  static async ajoutProcessus(values) {
    try {
      let dt = datetime.create();
      let date = dt.format('d/m/Y H:M:S');
      let statut = 'Terminé';
      values.push(date);

      return await db.execute(
        'INSERT INTO lst_processus SET titre =?,type =?,statut =?,annee =?,admin =?,note =?,h_debut =?,h_fin =?',
        [values[0], values[1], statut, values[2], values[3], values[4], values[5], date]
      );
    } catch (error) {
      console.error("Erreur dans ajoutProcessus:", error);
      throw new Error("Erreur lors de l'ajout du processus");
    }
  }

  static async ajoutProcessusDetails(id, issn, eissn, plateforme) {
    try {
      const dt = datetime.create();
      const date = dt.format('d/m/Y H:M:S');
      const values = [id, issn, eissn, plateforme];

      const [lastId] = await db.execute('SELECT MAX(id_processus) as id_processus FROM lst_processus');
      const idPr = lastId[0]['id_processus'] + 1;
      values.push(idPr);
      values.push(date);

      return await db.execute(
        'INSERT INTO lst_processus_details SET idRevue =?, ISSN =?, EISSN =?, plateforme =?, id_processus =?, dateA =?',
        values
      );
    } catch (error) {
      console.error("Erreur dans ajoutProcessusDetails:", error);
      throw new Error("Erreur lors de l'ajout des détails du processus");
    }
  }

  static async matchIdRevue(issn, eissn, processus) {
    let valIdMatch = [];
    let sqlMatch = '';
    let idRevue;

    try {
      // Construire la requête SQL en fonction des paramètres issn et eissn
      if (issn === '-' && eissn !== '-') {
        sqlMatch = 'ISSN =? OR EISSN=?';
        valIdMatch.push(eissn, eissn);
      } else if (issn !== '-' && eissn === '-') {
        sqlMatch = 'ISSN =? OR EISSN=?';
        valIdMatch.push(issn, issn);
      } else if (issn !== '-' && eissn !== '-') {
        sqlMatch = '(ISSN =? OR EISSN=?) OR (ISSN =? OR EISSN=?)';
        valIdMatch.push(issn, eissn, eissn, issn);
      }

      if (sqlMatch !== '') {
        // Exécuter la requête SQL
        const [rows] = await db.execute("SELECT idRevue as id FROM tbl_periodiques WHERE " + sqlMatch + " LIMIT 0,1", valIdMatch);
        idRevue = rows;
      }

      // Si aucun match trouvé ou si la requête n'a pas retourné de résultats
      if (!idRevue || idRevue.length === 0) {
        if (processus !== 'fiche') {
          await this.ajoutProcessusDetails(-1, issn, eissn, '');
        }
        return '-1';
      } else {
        return idRevue[0]['id'];
      }

    } catch (error) {
      console.error("Erreur dans matchIdRevue:", error);
      return '-1';  // Retourner '-1' en cas d'erreur pour indiquer qu'aucun id n'a été trouvé
    }
  }


  static async valideIdRevue(idRevue){
    let count= await db.execute('SELECT COUNT(idRevue) AS count FROM tbl_periodiques  WHERE idRevue = ?  ',[idRevue])

    if (count[0]['0']['count']==0){
      return false;
    }
    else
      return true;
  }

};

