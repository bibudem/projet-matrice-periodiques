const db = require('../util/database');
let SqlString = require('sqlstring'); //global declare
let datetime = require('node-datetime');
const { buildExactFilters, buildLikeFilters, combine, placeholders } = require('../util/sqlFilters');

// tbl_periodiques : correspondance exacte. tbl_statistiques.plateforme : stocke
// une seule plateforme par ligne, mais on garde le LIKE pour la coherence avec
// le comportement existant (ex: recherche partielle par prefixe de PlatformID).
const EXACT_COLUMNS = ['statut','domaine','secteur','abonnement','bdd','fournisseur','accesCourant'];
const LIKE_COLUMNS = ['plateforme'];

module.exports = class ListeStatistique {
  constructor() {

  }


  static fetchAll(annee) {
    return db.execute('SELECT idStatistique,annee,tbl_statistiques.idRevue as idP,Total_Item_Requests,Unique_Item_Requests,No_License,citations,articlesUdem,tbl_periodiques.titre as titreP,tbl_statistiques.plateforme as plateforme,tbl_statistiques.dateA as dateA,tbl_statistiques.dateM as dateM,statut,abonnement,ISSN,EISSN,domaine,secteur FROM tbl_statistiques INNER JOIN tbl_periodiques ON tbl_statistiques.idRevue=tbl_periodiques.idRevue where annee = ? order by idP ',[annee]);
  }

  static fetchAllPaginated(annee, skip, limit, search, sortColumn, sortDirection) {
    const colMap = {
      'titre': 'tbl_periodiques.titre',
      'plateforme': 'tbl_statistiques.plateforme',
      'annee': 'annee',
      'telech': 'Total_Item_Requests',
      'refus': 'No_License',
      'citation': 'citations',
      'articlesUdem': 'articlesUdem',
      'dateA': 'tbl_statistiques.dateA',
      'dateM': 'tbl_statistiques.dateM',
    };
    const col = colMap[sortColumn] || 'tbl_periodiques.titre';
    const dir = sortDirection === 'desc' ? 'DESC' : 'ASC';
    const searchParam = search ? `%${search}%` : '%';
    return db.execute(
      `SELECT idStatistique,annee,tbl_statistiques.idRevue as idP,Total_Item_Requests,Unique_Item_Requests,No_License,citations,articlesUdem,tbl_periodiques.titre as titreP,tbl_statistiques.plateforme as plateforme,tbl_statistiques.dateA as dateA,tbl_statistiques.dateM as dateM FROM tbl_statistiques INNER JOIN tbl_periodiques ON tbl_statistiques.idRevue=tbl_periodiques.idRevue WHERE annee = ? AND (tbl_periodiques.titre LIKE ? OR tbl_statistiques.plateforme LIKE ?) ORDER BY ${col} ${dir} LIMIT ? OFFSET ?`,
      [annee, searchParam, searchParam, limit, skip]
    );
  }

  static countAll(annee, search) {
    const searchParam = search ? `%${search}%` : '%';
    return db.execute(
      'SELECT COUNT(*) as count FROM tbl_statistiques INNER JOIN tbl_periodiques ON tbl_statistiques.idRevue=tbl_periodiques.idRevue WHERE annee = ? AND (tbl_periodiques.titre LIKE ? OR tbl_statistiques.plateforme LIKE ?)',
      [annee, searchParam, searchParam]
    );
  }

  // annees: tableau d'annees (strings/numbers). filtres: objet {colonne: 'valeur'|'valeur1,valeur2'}
  // envoye par le frontend (une cle par filtre selectionne dans le formulaire de rapport-statistique).
  static async donneesStatistiqueRapport(annees, filtres) {
    const anneesArr = (Array.isArray(annees) ? annees : annees.toString().split(','))
      .map(a => a.toString().trim()).filter(a => a !== '');

    // IN () est une erreur de syntaxe SQL — pas d'annee selectionnee = pas de resultats
    if (anneesArr.length === 0) return [[]];

    const combined = combine(
      buildExactFilters(filtres, EXACT_COLUMNS),
      buildLikeFilters(filtres, LIKE_COLUMNS)
    );

    const sql = `SELECT titre,ISSN,EISSN,statut,abonnement,bdd,accesCourant,domaine,secteur,fournisseur,tbl_periodiques.idRevue as idP,annee,Total_Item_Requests,Unique_Item_Requests,No_License, citations , articlesUdem,  JR4COURANT,  JR4INTER,  JR4RETRO,  JR3OAGOLD,plateforme FROM \`tbl_periodiques\` LEFT JOIN tbl_statistiques ON tbl_periodiques.idRevue=tbl_statistiques.idRevue WHERE annee IN (${placeholders(anneesArr.length)})` + combined.clause + " ORDER BY idP, annee";
    return db.execute(sql, [...anneesArr, ...combined.params]);
  }


};

