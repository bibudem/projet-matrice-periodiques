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
    return db.execute("SELECT * FROM lst_processus  order by id_processus DESC ");
  }

  static getAllDetailsProcessus(id) {
    return db.execute('SELECT id_details,lst_processus_details.id_processus as id_processus, lst_processus_details.idRevue as idRevue,lst_processus_details.ISSN as ISSN,lst_processus_details.EISSN as EISSN, titre, lst_processus_details.dateA as dateA FROM lst_processus_details Left JOIN tbl_periodiques on lst_processus_details.idRevue=tbl_periodiques.idRevue where id_processus = ? order by id_details DESC',[id]);
  }

  static getAllDetailsProcessusPaginated(id, skip, limit, search = '') {
    const params = [id];
    let searchClause = '';
    if (search && search.trim()) {
      const s = `%${search}%`;
      searchClause = ' AND (d.idRevue LIKE ? OR d.ISSN LIKE ? OR d.EISSN LIKE ? OR p.titre LIKE ?)';
      params.push(s, s, s, s);
    }
    const sql = `SELECT d.id_details, d.id_processus, d.idRevue, d.ISSN, d.EISSN, p.titre, d.dateA
                 FROM lst_processus_details d
                 LEFT JOIN tbl_periodiques p ON d.idRevue = p.idRevue
                 WHERE d.id_processus = ?${searchClause}
                 ORDER BY d.id_details DESC
                 LIMIT ${parseInt(limit)} OFFSET ${parseInt(skip)}`;
    return db.execute(sql, params);
  }

  static countAllDetails(id, search = '') {
    const params = [id];
    let searchClause = '';
    if (search && search.trim()) {
      const s = `%${search}%`;
      searchClause = ' AND (d.idRevue LIKE ? OR d.ISSN LIKE ? OR d.EISSN LIKE ? OR p.titre LIKE ?)';
      params.push(s, s, s, s);
    }
    const sql = `SELECT COUNT(*) as count FROM lst_processus_details d
                 LEFT JOIN tbl_periodiques p ON d.idRevue = p.idRevue
                 WHERE d.id_processus = ?${searchClause}`;
    return db.execute(sql, params);
  }

  static getLastIdProcessus() {
    return db.execute("SELECT MAX(id_processus) AS max FROM lst_processus  ");
  }

  static async postPrix(values, cache) {
    //creation de la date
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');
    if(values[0]=='-' && values[1]=='-' && values[2]=='-'){
      return [];
    }
    //si non valid idRevue
    if(values[0]!='-' ){
      let valid= await this.valideIdRevue(values[0], cache);
      if(!valid){
        await this.ajoutProcessusDetails(values[0],'-1','','', cache)
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
      tabValue['idRevue']=await this.matchIdRevue(tabValue['ISSN'],tabValue['EISSN'],'autre', cache);
    }
    //si non match
    if(tabValue['idRevue']=='-1'){
      return []
    }

    await this.withLock(cache, `prix|${tabValue['idRevue']}|${tabValue['annee']}`, async () => {
      let prixAnnee= await db.execute("SELECT Count(idRevue) as count  FROM tbl_prix_periodiques  WHERE idRevue = ? and  annee=?",[tabValue['idRevue'],tabValue['annee']]);

      if(prixAnnee[0]['0']['count']==0){
        await db.execute('INSERT INTO tbl_prix_periodiques SET prix = ?,note = ?,dateA = ?,annee= ? ,idRevue= ?', [tabValue['prix'],tabValue['note'],tabValue['date'],tabValue['annee'],tabValue['idRevue']] );
      }
      else {
        await db.execute('UPDATE tbl_prix_periodiques SET prix =?,note =?,dateM =? WHERE idRevue=? and annee=?', [tabValue['prix'],tabValue['note'],tabValue['date'],tabValue['idRevue'],tabValue['annee']] );
      }
    });
    /** Ajout details processus*/
    await this.ajoutProcessusDetails(tabValue['idRevue'],tabValue['ISSN'],tabValue['EISSN'],'', cache);
  }

  static async postArchives(values, cache) {
    //creation de la date
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');
    if(values[0]=='-' && values[1]=='-' && values[2]=='-'){
      return [];
    }
    //si non valid idRevue
    if(values[0]!='-' ){
      let valid= await this.valideIdRevue(values[0], cache);
      if(!valid){
        await this.ajoutProcessusDetails(values[0],'-1','','', cache)
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
      tabValue['idRevue']=await this.matchIdRevue(tabValue['ISSN'],tabValue['EISSN'],'autre', cache);
    }
    //si non match
    if(tabValue['idRevue']=='-1'){
      return []
    }

    await this.withLock(cache, `archives|${tabValue['idRevue']}|${tabValue['anneeDebut']}|${tabValue['anneeFin']}`, async () => {
      let archives= await db.execute("SELECT Count(idRevue) as count  FROM tbl_archives  WHERE idRevue = ? and  anneeDebut=? and anneeFin=?",[tabValue['idRevue'],tabValue['anneeDebut'],tabValue['anneeFin']]);
      //console.log(prixAnnee[0]['0']['count']);
      if(archives[0]['0']['count']==0){
        await db.execute('INSERT INTO tbl_archives SET idRevue = ?,perennite = ?,conserverPap = ?,anneeDebut= ? ,anneeFin= ?,volDebut= ?,volFin= ?,embargo= ?,fournisseur= ?,dateA=?', [tabValue['idRevue'],tabValue['perennite'],tabValue['conserverPap'],tabValue['anneeDebut'],tabValue['anneeFin'],tabValue['volDebut'],tabValue['volFin'],tabValue['embargo'],tabValue['fournisseur'],tabValue['date']] );
      }
      else {
        await db.execute('UPDATE tbl_archives SET perennite =?,conserverPap =?,volDebut =?,volFin =?,embargo =?,fournisseur =?,dateM =? WHERE idRevue=? and anneeDebut=? and anneeFin=?', [tabValue['perennite'],tabValue['conserverPap'],tabValue['volDebut'],tabValue['volFin'],tabValue['embargo'],tabValue['fournisseur'],tabValue['date'],tabValue['idRevue'],tabValue['anneeDebut'],tabValue['anneeFin']] );
      }
    });
    /** Ajout details processus*/
    await this.ajoutProcessusDetails(tabValue['idRevue'],tabValue['ISSN'],tabValue['EISSN'],'', cache);
  }

  static async postStatistiques(values, cache) {
  try {
    // Création de la date
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');

    // Construction des données
    const tabValue = {
      idRevue: values[0],
      ISSN: values[1],
      EISSN: values[2],
      annee: values[3],
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
    if (tabValue.idRevue !== '-') {
      let valid = await this.valideIdRevue(tabValue.idRevue, cache);
      if (!valid) {
        await this.ajoutProcessusDetails(tabValue.idRevue, '-1', tabValue.EISSN, tabValue.plateforme, cache);
        return [];
      }
    }

    // Chercher l'id du revue si absent
    if (tabValue.idRevue === '-') {
      tabValue.idRevue = await this.matchIdRevue(tabValue.ISSN, tabValue.EISSN, 'autre', cache);
    }

    // Si l'idRevue n'a pas été trouvé
    if (tabValue.idRevue === '-1') {
      return [];
    }

    // Ignorer si tous les champs de stats sont vides
    if (
      [tabValue.Total_Item_Requests, tabValue.No_License, tabValue.citations,
       tabValue.articlesUdem, tabValue.JR4COURANT, tabValue.JR4INTER,
       tabValue.JR4RETRO, tabValue.JR3OAGOLD].every(v => v === '-')
      && tabValue.plateforme === ''
    ) {
      return [];
    }

    await this.withLock(cache, `stats|${tabValue.idRevue}|${tabValue.annee}|${tabValue.plateforme}`, async () => {
      // Vérifier si la ligne existe déjà
      let params = [tabValue.idRevue, tabValue.annee];
      let condition = '';

      if (tabValue.plateforme !== '') {
        condition = 'AND plateforme = ?';
        params.push(tabValue.plateforme);
      }

      const [rows] = await db.execute(
        `SELECT idStatistique
         FROM tbl_statistiques
         WHERE idRevue = ? AND annee = ? ${condition}`,
        params
      );

      if (rows.length > 0) {
        // ---- UPDATE ----
        tabValue.dateM = date;
        let valuesUpdate = [];
        let updateColumns = Object.keys(tabValue)
          .map(key => {
            if (!['ISSN','EISSN','idRevue','annee'].includes(key) && tabValue[key] !== '-') {
              valuesUpdate.push(tabValue[key]);
              return `${key} = ?`;
            }
          })
          .filter(Boolean)
          .join(', ');

        valuesUpdate.push(tabValue.idRevue, tabValue.annee);
        if (tabValue.plateforme !== '') valuesUpdate.push(tabValue.plateforme);

        await db.execute(
          `UPDATE tbl_statistiques
           SET ${updateColumns}
           WHERE idRevue = ? AND annee = ? ${tabValue.plateforme !== '' ? 'AND plateforme = ?' : ''}`,
          valuesUpdate
        );

      } else {
        // ---- INSERT ----
        tabValue.dateA = date;
        let valuesInsert = [];
        let insertColumns = Object.keys(tabValue)
          .map(key => {
            if (!['ISSN','EISSN'].includes(key) && tabValue[key] !== '-') {
              valuesInsert.push(tabValue[key]);
              return `${key} = ?`;
            }
          })
          .filter(Boolean)
          .join(', ');

        await db.execute(
          `INSERT INTO tbl_statistiques
           SET ${insertColumns}`,
          valuesInsert
        );
      }
    });

    return await this.ajoutProcessusDetails(tabValue.idRevue, tabValue.ISSN, tabValue.EISSN, tabValue.plateforme, cache);

  } catch (error) {
    console.error("Error in postStatistiques:", error);
    throw error;
  }
}


// procedure pour la mise a jour manuellement des periodique
  static async postPeriodiques(values, cache) {
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
      condSql += ', accesCourant = ?';
      tabValue.push(values[5]);
    }
    if(values[6]!='-'){
      condSql += ', abonnement = ?';
      tabValue.push(values[6]);
    }
    if(values[7]!='-'){
      condSql += ', bdd = ?';
      tabValue.push(values[7]);
    }
    if(values[8]!='-'){
      condSql += ', fonds = ?';
      tabValue.push(values[8]);
    }
    if(values[9]!='-'){
      condSql += ', fournisseur = ?';
      tabValue.push(values[9]);
    }
    //Chercher l'id de la plateforme
    if(values[10]!='-'){
      let plId = cache ? cache.plateformeToId.get(values[10]) : undefined;
      if(!cache){
        let plResult = await db.execute('SELECT idPlateforme AS id FROM lst_plateformes WHERE titrePlateforme = ? or PlatformID = ?', [values[10], values[10]]);
        if(plResult[0].length > 0){
          plId = plResult[0][0]['id'].toString();
        }
      }
      if(plId){
        tabValue.push(plId);
        condSql += ', plateformePrincipale = ?';
      }
    }
    //Chercher les id des autres plateforme
    if(values[11]!='-'){
      let listPl = values[11].split(",");
      let listId ='', idP, nom;
      for(let i=0;i<listPl.length;i++){
        nom = listPl[i].trim();
        if(cache){
          idP = cache.plateformeToId.get(nom);
          if(idP) listId+=idP+',';
          continue;
        }
        idP = await db.execute('SELECT idPlateforme AS id FROM lst_plateformes WHERE titrePlateforme = ? or PlatformID = ?', [nom, nom]);
        if(idP && idP[0].length > 0){
          listId+=idP[0][0]['id']+',';
        }
      }
      if(listId!=''){
        tabValue.push(listId);
        condSql += ', autrePlateforme = ?';
      }
    }
    if(values[12]!='-'){
      condSql += ', format = ?';
      tabValue.push(values[12]);
    }
    if(values[13]!='-'){
      condSql += ', libreAcces = ?';
      tabValue.push(values[13]);
    }
    if(values[14]!='-'){
      condSql += ', domaine = ?';
      tabValue.push(values[14]);
    }
    if(values[15]!='-'){
      condSql += ', secteur = ?';
      tabValue.push(values[15]);
    }
    if(values[16]!='-'){
      condSql += ', sujets = ?';
      tabValue.push(values[16]);
    }
    if(values[17]!='-'){
      condSql += ', entente_consortiale = ?';
      tabValue.push(values[17]);
    }
    if(values[18]!='-'){
      condSql += ', duplication = ?';
      tabValue.push(values[18]);
    }
    if(values[19]!='-'){
      condSql += ', duplicationCourant = ?';
      tabValue.push(values[19]);
    }
    if(values[20]!='-'){
      condSql += ', duplicationEmbargo1 = ?';
      tabValue.push(values[20]);
    }
    if(values[21]!='-'){
      condSql += ', duplicationEmbargo2 = ?';
      tabValue.push(values[21]);
    }
    if(values[22]!='-'){
      condSql += ', essentiel2014 = ?';
      tabValue.push(values[22]);
    }
    if(values[23]!='-'){
      condSql += ', essentiel2022 = ?';
      tabValue.push(values[23]);
    }

    // si tous les champs sont '-'
    if(condSql==''){
      return []
    }
    // supprimer ',' du debut de la condition
    condSql = condSql.slice(1);
    tabValue.push(date);
    tabValue.push(tabValue['idRevue']);

    //console.log(tabValue);
    //si non valid idRevue
    if (tabValue['idRevue'] !== '-') {
      let valid = await this.valideIdRevue(values[0], cache);
      if (valid) {
        let sql0= 'UPDATE tbl_periodiques SET ' + condSql + ', dateM =? WHERE idRevue=?';
        await db.execute(sql0, [...tabValue]);
      } else {
        // ID invalide -> insérer une nouvelle fiche avec un nouvel idRevue
        tabValue['idRevue'] = '-';
      }
    }
    if(tabValue['idRevue']=='-'){
      await this.withLock(cache, `fiche|${tabValue['ISSN']}|${tabValue['EISSN']}`, async () => {
        tabValue['idRevue']=await this.matchIdRevue(tabValue['ISSN'],tabValue['EISSN'],'fiche', cache);
        //si non match ajouter une nouvelle fiche
        //Non plus besoin selon le ticket 125 dans DevOps
        if(tabValue['idRevue']=='-1'){
          tabValue.pop();
          tabValue.push(null);
          let sql1= 'INSERT INTO tbl_periodiques SET ' + condSql + ',dateA =?,idRevue=?';
          //console.log('sql1: ', SqlString.format(sql1,tabValue));
          const [insertResult] = await db.execute(sql1, [...tabValue]);
          // insertId vient directement du resultat de l'INSERT (fiable meme sous concurrence),
          // plutot qu'un SELECT MAX(idRevue) qui pourrait, en theorie, lire l'id d'une autre
          // ligne inseree au meme instant par un autre traitement concurrent du meme lot.
          tabValue['idRevue']=insertResult.insertId;
          if(cache){
            const newId = String(tabValue['idRevue']);
            cache.validIds.add(newId);
            if(tabValue['ISSN'] && tabValue['ISSN']!=='-' && !cache.issnEissnToId.has(tabValue['ISSN'])) cache.issnEissnToId.set(tabValue['ISSN'], newId);
            if(tabValue['EISSN'] && tabValue['EISSN']!=='-' && !cache.issnEissnToId.has(tabValue['EISSN'])) cache.issnEissnToId.set(tabValue['EISSN'], newId);
          }
        } else {
          tabValue.pop();
          tabValue.push(tabValue['idRevue']);

          const sql2 = `UPDATE tbl_periodiques SET ${condSql}, dateM = ? WHERE idRevue = ?`;
          //console.log('sql2: ', SqlString.format(sql2, [...tabValue]));

          await db.execute(sql2, [...tabValue]);
        }
      });
    }

    /** Ajout details processus*/
    return await this.ajoutProcessusDetails(tabValue['idRevue'],tabValue['ISSN'],tabValue['EISSN'],'', cache);
  }

  // procedure pour la mise a jour manuellement des periodique
  static async postListUpdatePeriodiques(values, cache) {
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
      condSql += ', accesCourant = ?';
      tabValue.push(values[5]);
    }
    if(values[6]!='-'){
      condSql += ', abonnement = ?';
      tabValue.push(values[6]);
    }
    if(values[7]!='-'){
      condSql += ', bdd = ?';
      tabValue.push(values[7]);
    }
    if(values[8]!='-'){
      condSql += ', fonds = ?';
      tabValue.push(values[8]);
    }
    if(values[9]!='-'){
      condSql += ', fournisseur = ?';
      tabValue.push(values[9]);
    }
    //Chercher l'id de la plateforme
    if(values[10]!='-'){
      let plId = cache ? cache.plateformeToId.get(values[10]) : undefined;
      if(!cache){
        let plResult = await db.execute('SELECT idPlateforme AS id FROM lst_plateformes WHERE titrePlateforme = ? or PlatformID = ?', [values[10], values[10]]);
        if(plResult[0].length > 0){
          plId = plResult[0][0]['id'].toString();
        }
      }
      if(plId){
        tabValue.push(plId);
        condSql += ', plateformePrincipale = ?';
      }
    }
    //Chercher les id des autres plateforme
    if(values[11]!='-'){
      let listPl = values[11].split(",");
      let listId ='', idP, nom;
      for(let i=0;i<listPl.length;i++){
        nom = listPl[i].trim();
        if(cache){
          idP = cache.plateformeToId.get(nom);
          if(idP) listId+=idP+',';
          continue;
        }
        idP = await db.execute('SELECT idPlateforme AS id FROM lst_plateformes WHERE titrePlateforme = ? or PlatformID = ?', [nom, nom]);
        if(idP && idP[0].length > 0){
          listId+=idP[0][0]['id']+',';
        }
      }
      if(listId!=''){
        tabValue.push(listId);
        condSql += ', autrePlateforme = ?';
      }
    }
    if(values[12]!='-'){
      condSql += ', format = ?';
      tabValue.push(values[12]);
    }
    if(values[13]!='-'){
      condSql += ', libreAcces = ?';
      tabValue.push(values[13]);
    }
    if(values[14]!='-'){
      condSql += ', domaine = ?';
      tabValue.push(values[14]);
    }
    if(values[15]!='-'){
      condSql += ', secteur = ?';
      tabValue.push(values[15]);
    }
    if(values[16]!='-'){
      condSql += ', sujets = ?';
      tabValue.push(values[16]);
    }
    if(values[17]!='-'){
      condSql += ', entente_consortiale = ?';
      tabValue.push(values[17]);
    }
    if(values[18]!='-'){
      condSql += ', duplication = ?';
      tabValue.push(values[18]);
    }
    if(values[19]!='-'){
      condSql += ', duplicationCourant = ?';
      tabValue.push(values[19]);
    }
    if(values[20]!='-'){
      condSql += ', duplicationEmbargo1 = ?';
      tabValue.push(values[20]);
    }
    if(values[21]!='-'){
      condSql += ', duplicationEmbargo2 = ?';
      tabValue.push(values[21]);
    }
    if(values[22]!='-'){
      condSql += ', essentiel2014 = ?';
      tabValue.push(values[22]);
    }
    if(values[23]!='-'){
      condSql += ', essentiel2022 = ?';
      tabValue.push(values[23]);
    }

    // si tous les champs sont '-'
    if(condSql==''){
      return []
    }
    // supprimer ',' du debut de la condition
    condSql = condSql.slice(1);
    tabValue.push(date);
    tabValue.push(tabValue['idRevue']);

    //console.log(tabValue);
    //si non valid idRevue
    if (tabValue['idRevue'] !== '-') {
      let valid = await this.valideIdRevue(values[0], cache);
      if (valid) {
        let sql0= 'UPDATE tbl_periodiques SET ' + condSql + ', dateM =? WHERE idRevue=?';
        await db.execute(sql0, [...tabValue]);
      } else {
        // ID invalide -> insérer une nouvelle fiche avec un nouvel idRevue
        tabValue['idRevue'] = '-';
      }
    }
    if(tabValue['idRevue']=='-'){
      tabValue['idRevue']=await this.matchIdRevue(tabValue['ISSN'],tabValue['EISSN'],'fiche', cache);
      //si non match ajouter une nouvelle fiche
      if(tabValue['idRevue']!='-1'){
        tabValue.pop();
        tabValue.push(tabValue['idRevue']);

        const sql2 = `UPDATE tbl_periodiques SET ${condSql}, dateM = ? WHERE idRevue = ?`;
        await db.execute(sql2, [...tabValue]);
      }
    }

    /** Ajout details processus*/
    return await this.ajoutProcessusDetails(tabValue['idRevue'],tabValue['ISSN'],tabValue['EISSN'],'', cache);
  }

  static async postAbonnement(values, cache) {
    //creation de la date
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');
    //ajouter la date dans le tableau des données
    const tabValue = [];
    const updateValues=[];
    let condSql = '';

    if(values[0]=='-' && values[1]=='-' && values[2]=='-'){
      return [];
    }

    //si non valid idRevue
    if(values[0]!='-' ){
      let valid= await this.valideIdRevue(values[0], cache);
      if(!valid){
        await this.ajoutProcessusDetails(values[0],'-1','','', cache)
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
      tabValue['idRevue']=await this.matchIdRevue(tabValue['ISSN'],tabValue['EISSN'],'autre', cache);
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
    return await this.ajoutProcessusDetails(tabValue['idRevue'],tabValue['ISSN'],tabValue['EISSN'],'', cache);

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
    let annee = values[2];
    let admin = values[3];
    let note = values[4];
    let h_debut = values[5];

    // Fonction utilitaire
    const safe = (val) => (val === undefined ? null : val);

    if (values[1] === 'periodiques') {
      annee = '-';
      admin = values[2];
      note = values[3];
      h_debut = values[4];
    }

    // 1️⃣ Insert du processus (sans plateforme encore)
    let sql1 = `
      INSERT INTO lst_processus 
      (titre, plateforme, type, statut, annee, admin, note, h_debut, h_fin) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(sql1, [
      safe(values[0]),
      null,  // plateforme sera mise à jour après
      safe(values[1]),
      safe(statut),
      safe(annee),
      safe(admin),
      safe(note),
      safe(h_debut),
      safe(date)
    ]);

    let insertedId = 0;
    let lastId= await db.execute('SELECT MAX(id_processus) as id_processus FROM lst_processus');
    insertedId=lastId[0]['0']['id_processus'];

    // 2️⃣ Update avec la concaténation des plateformes
    let sql2 = `
        UPDATE lst_processus p
        SET p.plateforme = (
          SELECT GROUP_CONCAT(DISTINCT d.plateforme SEPARATOR ' ')
          FROM lst_processus_details d
          WHERE d.id_processus = p.id_processus
        )
        WHERE p.id_processus = ?
      `;

    await db.execute(sql2, [insertedId]);

    return insertedId;

  } catch (error) {
    console.error("Erreur dans ajoutProcessus:", error);
    throw new Error("Erreur lors de l'ajout du processus");
  }
}


  static async ajoutProcessusDetails(id, issn, eissn, plateforme, cache) {
    try {
      const dt = datetime.create();
      const date = dt.format('d/m/Y H:M:S');
      const values = [id, issn, eissn, plateforme];

      let idPr;
      if (cache) {
        idPr = cache.nextIdProcessus;
      } else {
        const [lastId] = await db.execute('SELECT MAX(id_processus) as id_processus FROM lst_processus');
        idPr = lastId[0]['id_processus'] + 1;
      }
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

  static async matchIdRevue(issn, eissn, processus, cache) {
    if (cache) {
      let idRevue;
      if (issn !== '-' && cache.issnEissnToId.has(issn)) {
        idRevue = cache.issnEissnToId.get(issn);
      } else if (eissn !== '-' && cache.issnEissnToId.has(eissn)) {
        idRevue = cache.issnEissnToId.get(eissn);
      }
      if (idRevue === undefined) {
        if (processus !== 'fiche') {
          await this.ajoutProcessusDetails(-1, issn, eissn, '', cache);
        }
        return '-1';
      }
      return idRevue;
    }

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


  static async valideIdRevue(idRevue, cache){
    if (cache) {
      return cache.validIds.has(String(idRevue));
    }
    let count= await db.execute('SELECT COUNT(idRevue) AS count FROM tbl_periodiques  WHERE idRevue = ?  ',[idRevue])

    if (count[0]['0']['count']==0){
      return false;
    }
    else
      return true;
  }

  // Construit un cache de lot (une seule fois par import bulk) pour eviter de refaire
  // les memes SELECT de validation/correspondance a chaque ligne du fichier.
  static async buildBatchCache() {
    const [periodiquesResult, plateformesResult, maxProcessusResult] = await Promise.all([
      db.execute('SELECT idRevue, ISSN, EISSN FROM tbl_periodiques ORDER BY idRevue ASC'),
      db.execute('SELECT idPlateforme AS id, titrePlateforme, PlatformID FROM lst_plateformes'),
      db.execute('SELECT MAX(id_processus) AS id_processus FROM lst_processus'),
    ]);

    const validIds = new Set();
    const issnEissnToId = new Map();
    for (const row of periodiquesResult[0]) {
      const id = String(row.idRevue);
      validIds.add(id);
      if (row.ISSN && !issnEissnToId.has(row.ISSN)) issnEissnToId.set(row.ISSN, id);
      if (row.EISSN && !issnEissnToId.has(row.EISSN)) issnEissnToId.set(row.EISSN, id);
    }

    const plateformeToId = new Map();
    for (const p of plateformesResult[0]) {
      const id = String(p.id);
      if (p.titrePlateforme) plateformeToId.set(p.titrePlateforme, id);
      if (p.PlatformID) plateformeToId.set(p.PlatformID, id);
    }

    const nextIdProcessus = (maxProcessusResult[0][0].id_processus || 0) + 1;

    return { validIds, issnEissnToId, plateformeToId, nextIdProcessus, locks: new Map() };
  }

  // Serialise les appels de `fn` partageant la meme `key` (ex: meme ISSN/EISSN, meme idRevue+annee)
  // pendant que des lignes portant des cles differentes continuent de s'executer en parallele.
  // Necessaire car le traitement des lignes est desormais concurrent : sans ca, deux lignes du
  // meme fichier visant la meme fiche (ex: ISSN inconnu en double) pourraient toutes les deux
  // conclure "non trouve" et creer chacune une fiche en double.
  static async withLock(cache, key, fn) {
    if (!cache) return fn();
    const previous = cache.locks.get(key) || Promise.resolve();
    let release;
    const current = new Promise(resolve => { release = resolve; });
    cache.locks.set(key, previous.then(() => current));
    await previous;
    try {
      return await fn();
    } finally {
      release();
    }
  }

  // Traite `items` avec au plus `concurrency` appels de `fn` en vol simultanement,
  // sans attendre la fin d'un lot avant de lancer le suivant (contrairement a un for...of sequentiel).
  static async runBatched(items, concurrency, fn) {
    const results = new Array(items.length);
    let index = 0;
    async function worker() {
      while (index < items.length) {
        const current = index++;
        results[current] = await fn(items[current], current);
      }
    }
    const workers = Array.from({length: Math.min(concurrency, items.length)}, () => worker());
    await Promise.all(workers);
    return results;
  }

};

