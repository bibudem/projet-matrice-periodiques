const db = require('../util/database');
let SqlString = require('sqlstring'); //global declare
let datetime = require('node-datetime');
const { buildExactFilters, buildLikeFilters, combine, asWhere } = require('../util/sqlFilters');

// Champs a correspondance exacte (une seule valeur par ligne) vs champs stockant
// une liste denormalisee dans une seule cellule (necessite une correspondance LIKE).
const EXACT_COLUMNS = ['statut','domaine','secteur','abonnement','bdd','accesCourant','essentiel2014','essentiel2022','fournisseur','libreAcces'];
const LIKE_COLUMNS = ['plateformePrincipale','autrePlateforme'];

module.exports = class Periodique {
  constructor(id,titre) {
    this.idRevue = id;
    this.titre = titre;
    this.ISSN = ISSN;
  }


  static fetchAll() {
    return db.execute('SELECT * FROM tbl_periodiques order by titre');
  }

  static fetchAllPaginated(skip, limit, search = '', sortColumn = 'titre', sortDirection = 'asc') {
    const allowedColumns = ['idRevue', 'titre', 'ISSN', 'EISSN', 'secteur', 'domaine', 'abonnement', 'bdd', 'statut', 'dateA', 'dateM'];
    const col = allowedColumns.includes(sortColumn) ? sortColumn : 'titre';
    const dir = sortDirection === 'desc' ? 'DESC' : 'ASC';

    let whereClause = '';
    if (search && search.trim()) {
      const escapedSearch = db.escape(`%${search}%`);
      whereClause = ` WHERE (idRevue LIKE ${escapedSearch} OR titre LIKE ${escapedSearch} OR ISSN LIKE ${escapedSearch} OR EISSN LIKE ${escapedSearch} OR secteur LIKE ${escapedSearch} OR domaine LIKE ${escapedSearch} OR abonnement LIKE ${escapedSearch} OR bdd LIKE ${escapedSearch} OR statut LIKE ${escapedSearch})`;
    }
    const sql = `SELECT * FROM tbl_periodiques ${whereClause} ORDER BY \`${col}\` ${dir} LIMIT ${limit} OFFSET ${skip}`;
    return db.execute(sql);
  }

  static countAll(search = '') {
    let whereClause = '';
    if (search && search.trim()) {
      const escapedSearch = db.escape(`%${search}%`);
      whereClause = ` WHERE (idRevue LIKE ${escapedSearch} OR titre LIKE ${escapedSearch} OR ISSN LIKE ${escapedSearch} OR EISSN LIKE ${escapedSearch} OR secteur LIKE ${escapedSearch} OR domaine LIKE ${escapedSearch} OR abonnement LIKE ${escapedSearch} OR bdd LIKE ${escapedSearch} OR statut LIKE ${escapedSearch})`;
    }
    const sql = `SELECT COUNT(*) as count FROM tbl_periodiques ${whereClause}`;
    return db.execute(sql);
  }

  // filtres: objet {colonne: 'valeur' | 'valeur1,valeur2'} envoye par le frontend
  // (une cle par filtre selectionne dans le formulaire de rapport-periodique).
  static fetchRapportAll(filtres) {
    const combined = combine(
      buildExactFilters(filtres, EXACT_COLUMNS),
      buildLikeFilters(filtres, LIKE_COLUMNS)
    );
    return db.execute('SELECT * FROM `view_rapport_periodiques_all` ' + asWhere(combined) + ' ORDER BY idP', combined.params);
  }

  static async fetchRapportAutres(filtres) {
    const { clause, params } = buildLikeFilters(filtres, LIKE_COLUMNS);

    let notes = await db.execute(
      "SELECT idP, GROUP_CONCAT('Note: ', tbl_notes.note, ', ', ' ', tbl_notes.dateA) AS notes FROM view_rapport_periodiques_all INNER JOIN tbl_notes ON view_rapport_periodiques_all.idP = tbl_notes.idRevue WHERE note IS NOT NULL" + clause + " GROUP BY idP ORDER BY idP",
      params
    );
    let prix = await db.execute(
      "SELECT idP, GROUP_CONCAT(tbl_prix_periodiques.annee, ':', ' ', tbl_prix_periodiques.prix, '$ ') AS prix FROM view_rapport_periodiques_all INNER JOIN tbl_prix_periodiques ON view_rapport_periodiques_all.idP = tbl_prix_periodiques.idRevue WHERE prix IS NOT NULL" + clause + " GROUP BY idP ORDER BY idP",
      params
    );

    return [{ notes: notes[0], prix: prix[0] }];
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

