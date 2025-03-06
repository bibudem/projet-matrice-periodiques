const db = require('../util/database');
let SqlString = require('sqlstring'); //global declare
let datetime = require('node-datetime');

module.exports = class Periodique {
  constructor(id,titre) {
    this.idRevue = id;
    this.titre = titre;
    this.ISSN = ISSN;
  }


  static fetchAll() {
    return db.execute('SELECT * FROM tbl_periodiques order by titre');
  }

  static  fetchRapportAll(plateforme) {
    let sqlCondition='';
    let valPlateforme=plateforme.split('=')[1];
    let platformes=valPlateforme.split(',');
    if(valPlateforme!='vide' ){
      if(platformes.length>0){
        //console.log(platformes.length)
        sqlCondition+=" WHERE ( ";
        for (let i=0;i<platformes.length;i++){
          sqlCondition+="  `plateformePrincipale` LIKE'%" + platformes[i].toString() + "%' ";
          if(i<platformes.length-1){
            sqlCondition+=" OR ";
          }
        }
        sqlCondition+=" )";
      }
      else {
        sqlCondition=" WHERE `plateformePrincipale`='"+valPlateforme.toString()+"'";
      }
    }
    /*let sql = 'SELECT *  FROM `view_rapport_periodiques_all` '+sqlCondition+'  order by idP';
    console.log('sql: ', SqlString.format(sql));*/
    return db.execute('SELECT *  FROM `view_rapport_periodiques_all` '+sqlCondition+'  order by idP');
  }

  static  async fetchRapportAutres(plateforme) {
    let sqlCondition='';
    let valPlateforme=plateforme.split('=')[1];
    let platformes=valPlateforme.split(',');
    if(valPlateforme!='vide' ){
      if(platformes.length>0){
        sqlCondition+=" AND ( ";
        for (let i=0;i<platformes.length;i++){
          sqlCondition+="  plateformePrincipale  LIKE '%" + platformes[i].toString() + "%' ";
          if(i < platformes.length-1){
            sqlCondition+=" OR ";
          }
        }
        sqlCondition+=" )";
      }
      else {
        sqlCondition=" AND plateformePrincipale='"+valPlateforme.toString()+"'";
      }
    }
    let autresChamps = {};
    /*let sql = "Select idP,GROUP_CONCAT('Note: ',tbl_notes.note,', ',' ',tbl_notes.dateA) AS notes  from view_rapport_periodiques_all INNER JOIN tbl_notes on view_rapport_periodiques_all.idRevue=tbl_notes.idRevue where note is not null "+sqlCondition+"  GROUP BY idP  order by idP";
    console.log('sql: ', SqlString.format(sql));*/
    let notes= await db.execute(" Select idP,GROUP_CONCAT('Note: ',tbl_notes.note,', ',' ',tbl_notes.dateA) AS notes  from view_rapport_periodiques_all INNER JOIN tbl_notes on view_rapport_periodiques_all.idP=tbl_notes.idRevue where note is not null "+sqlCondition+"  GROUP BY idP   order by idP");
    let prix= await db.execute("Select idP,GROUP_CONCAT(tbl_prix_periodiques.annee ,':' , ' ',tbl_prix_periodiques.prix,'$ ') AS prix from view_rapport_periodiques_all INNER JOIN tbl_prix_periodiques on view_rapport_periodiques_all.idP=tbl_prix_periodiques.idRevue where prix is not null "+sqlCondition+"  GROUP BY idP   order by idP");

    autresChamps={"notes": notes[0],"prix":prix[0]};
    return [autresChamps]
  }

  static post(periodique) {
    // Création de la date au format 'YYYY-MM-DD HH:MM:SS'
    let date = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Ajout de la date à la liste des valeurs
    periodique.push(date);
    //console.log(periodique);
    // Requête SQL
    const sql = `INSERT INTO tbl_periodiques SET
        idRevue = ?, titre = ?, ISSN = ?, EISSN = ?, accesCourant = ?, statut = ?,
        abonnement = ?, bdd = ?, fonds = ?, fournisseur = ?, plateformePrincipale = ?,
        autrePlateforme = ?, format = ?, libreAcces = ?, domaine = ?, secteur = ?,
        sujets = ?, entente_consortiale = ?, duplication = ?, duplicationCourant = ?,
        duplicationEmbargo1 = ?, duplicationEmbargo2 = ?, essentiel2014 = ?,
        essentiel2022 = ?, dateA = ?`;

    // Log pour debug
    //console.log('SQL:', SqlString.format(sql, periodique));

    // Exécution de la requête SQL
    return db.execute(sql, periodique);
  }


  static update(periodique) {
    //creation de la date
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');
    //console.log(periodique);
    /*let sql = "UPDATE tbl_periodiques SET titre = ?,ISSN = ?,EISSN=?,statut = ?,accesCourant = ?,abonnement = ?,bdd = ?,fonds =?,fournisseur = ?,plateformePrincipale = ?,autrePlateforme =?,format = ?,libreAcces = ?,domaine =?,secteur = ?,sujets = ?,entente_consortiale = ?,duplication =?,duplicationCourant =?,duplicationEmbargo1 =?,duplicationEmbargo2 =?,essentiel2014 =?,essentiel2022 =?,dateM =? WHERE idRevue  = ?";
    console.log('sql: ', SqlString.format(sql,[periodique[1],periodique[2],periodique[3],periodique[4],periodique[5],periodique[6],periodique[7],periodique[8],periodique[9],periodique[10],periodique[11],periodique[12],periodique[13],periodique[14],periodique[15],periodique[16],periodique[17],periodique[18],periodique[19],periodique[20],periodique[21],periodique[22],periodique[23],date, periodique[0]]));*/
    return db.execute('UPDATE tbl_periodiques SET titre = ?,ISSN = ?,EISSN=?,statut = ?,accesCourant = ?,abonnement = ?,bdd = ?,fonds =?,fournisseur = ?,plateformePrincipale = ?,autrePlateforme =?,format = ?,libreAcces = ?,domaine =?,secteur = ?,sujets = ?,entente_consortiale = ?,duplication =?,duplicationCourant =?,duplicationEmbargo1 =?,duplicationEmbargo2 =?,essentiel2014 =?,essentiel2022 =?,dateM =? WHERE idRevue  = ?',
      [periodique[1],periodique[2],periodique[3],periodique[4],periodique[5],periodique[6],periodique[7],periodique[8],periodique[9],periodique[10],periodique[11],periodique[12],periodique[13],periodique[14],periodique[15],periodique[16],periodique[17],periodique[18],periodique[19],periodique[20],periodique[21],periodique[22],periodique[23],date, periodique[0]]);

  }

  static delete(idRevue) {
    return db.execute('DELETE FROM tbl_periodiques WHERE idRevue  = ?', [idRevue]);
  }
//recouperer la fiche
  static consulter(idRevue){
    return db.execute('SELECT * FROM tbl_periodiques WHERE idRevue  = ?', [idRevue]);
  }

};

