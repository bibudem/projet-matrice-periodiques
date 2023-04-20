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
    let i=0,sqlCondition=''
    let dt = datetime.create();
    let valPlateforme=plateforme.split('=')[1];

    if(valPlateforme!='vide'){
      valPlateforme=valPlateforme.toString();
      sqlCondition=" WHERE `plateformePrincipale`='"+valPlateforme+"'"
    }
    return db.execute('SELECT *  FROM `view_rapport_periodiques_all` '+sqlCondition+'  order by idP');
  }

  static  async fetchRapportAutres(plateforme) {
    let i=0,sqlCondition='';
    let dt = datetime.create();
    let anneeFormat = dt.format('Y');
    let valPlateforme=plateforme.split('=')[1];

    if(valPlateforme!='vide'){
      sqlCondition=" and `plateformePrincipale`='"+valPlateforme+"'"
    }
    let autresChamps = {};
    let notes= await db.execute('Select tbl_periodiques.idRevue as idP,GROUP_CONCAT(tbl_notes.note," ",tbl_notes.dateA) AS notes  from tbl_periodiques left join tbl_notes on tbl_periodiques.idRevue=tbl_notes.idRevue where note is not null '+sqlCondition+'  GROUP BY tbl_periodiques.idRevue   order by idP');
    let prix= await db.execute('Select tbl_periodiques.idRevue as idP,GROUP_CONCAT(tbl_prix_periodiques.prix, " ",tbl_prix_periodiques.annee) AS prix from tbl_periodiques left join tbl_prix_periodiques on tbl_periodiques.idRevue=tbl_prix_periodiques.idRevue where prix is not null '+sqlCondition+'  GROUP BY tbl_periodiques.idRevue   order by idP');
    //let cores= await db.execute('Select tbl_periodiques.idRevue as idP,GROUP_CONCAT(tbl_cores.annee, ";",tbl_cores.core, ";",tbl_cores.secteur) AS cores from tbl_periodiques left join tbl_cores on tbl_periodiques.idRevue=tbl_cores.idRevue where core is not null '+sqlCondition+'  GROUP BY tbl_periodiques.idRevue   order by idP');
    let archives= await db.execute('Select tbl_periodiques.idRevue as idP,GROUP_CONCAT(tbl_archives.perennite, " ",tbl_archives.conserverPap, " ",tbl_archives.anneeDebut, " ",tbl_archives.anneeFin, " ",tbl_archives.volDebut, " ",tbl_archives.volFin, " ",tbl_archives.embargo) AS archives from tbl_periodiques left join tbl_archives on tbl_periodiques.idRevue=tbl_archives.idRevue  '+sqlCondition+'  GROUP BY tbl_periodiques.idRevue   order by idP');
    //let prixUtil = await db.execute('SELECT tbl_prix_periodiques.idRevue as idP, (SELECT SUM(prix) FROM tbl_prix_periodiques where (`annee`="'+(anneeFormat-1)+'" OR `annee`="'+(anneeFormat-2)+'") AND idRevue=idP) /(SELECT SUM(Total_Item_Requests) FROM tbl_statistiques where (`annee`="'+(anneeFormat-1)+'" OR `annee`="'+(anneeFormat-2)+'") AND idRevue=idP) as prixUtil from tbl_prix_periodiques where prix is not null order by idP');
    //let sql = 'SELECT tbl_prix_periodiques.idRevue as idP, (SELECT SUM(prix) FROM tbl_prix_periodiques where (`annee`="'+(anneeFormat-1)+'" OR `annee`="'+(anneeFormat-2)+'") AND idRevue=idP) /(SELECT SUM(Total_Item_Requests) FROM tbl_statistiques where (`annee`="'+(anneeFormat-1)+'" OR `annee`="'+(anneeFormat-2)+'") AND idRevue=idP) as prixUtil from tbl_prix_periodiques where annee <> '-' or annee is not null order by idP';
    //console.log('sql: ', SqlString.format(sql));

    autresChamps={"notes": notes[0],"prix":prix[0],"archives":archives[0]};
    return [autresChamps]
  }

static post(periodique) {
  //creation de la date
  let dt = datetime.create();
  let date = dt.format('Y-m-d H:M:S');
  //console.log(date);
  //ajouter la date dans le tableau des données
  periodique.push(date);

  return db.execute('INSERT INTO tbl_periodiques SET titre = ?,ISSN = ?,EISSN =?,statut = ?,abonnement = ?,bdd = ?,fonds =?,fournisseur = ?,plateformePrincipale = ?,autrePlateforme =?,format = ?,libreAcces = ?,domaine =?,secteur = ?,sujets = ?,duplication =?,duplicationCourant =?,duplicationEmbargo1 =?,duplicationEmbargo2 =?,essentiel2014 =?,essentiel2022 =?,dateA =? ', periodique );
}

static update(periodique) {
   //creation de la date
  let dt = datetime.create();
  let date = dt.format('Y-m-d H:M:S');
  //afficher la requette
  /*let sql = "UPDATE tbl_periodiques SET titre = ?,ISSN = ?,EISSN=?,statut = ?,abonnement = ?,bdd = ?,fonds =?,fournisseur = ?,plateformePrincipale = ?,autrePlateforme =?,format = ?,libreAcces = ?,domaine =?,secteur = ?,sujets = ?,duplication =?,duplicationCourant =?,duplicationEmbargo1 =?,duplicationEmbargo2 =?,essentiel2014 =?,essentiel2022 =?,dateM =? WHERE idRevue  = ?"
  console.log('sql: ', SqlString.format(sql,[periodique[1],periodique[2],periodique[3],periodique[4],periodique[5],periodique[6],periodique[7],periodique[8],periodique[9],periodique[10],periodique[11],periodique[12],periodique[13],periodique[14],periodique[15],periodique[16],periodique[17],periodique[18],periodique[19],periodique[22],periodique[23],date, periodique[0]]));*/

  return db.execute('UPDATE tbl_periodiques SET titre = ?,ISSN = ?,EISSN=?,statut = ?,abonnement = ?,bdd = ?,fonds =?,fournisseur = ?,plateformePrincipale = ?,autrePlateforme =?,format = ?,libreAcces = ?,domaine =?,secteur = ?,sujets = ?,duplication =?,duplicationCourant =?,duplicationEmbargo1 =?,duplicationEmbargo2 =?,essentiel2014 =?,essentiel2022 =?,dateM =? WHERE idRevue  = ?',
                   [periodique[1],periodique[2],periodique[3],periodique[4],periodique[5],periodique[6],periodique[7],periodique[8],periodique[9],periodique[10],periodique[11],periodique[12],periodique[13],periodique[14],periodique[15],periodique[16],periodique[17],periodique[18],periodique[19],periodique[22],periodique[23],date, periodique[0]]);

}

static delete(idRevue) {
  return db.execute('DELETE FROM tbl_periodiques WHERE idRevue  = ?', [idRevue]);
}
//recouperer la fiche
static consulter(idRevue){
  return db.execute('SELECT * FROM tbl_periodiques WHERE idRevue  = ?', [idRevue]);
}

};

