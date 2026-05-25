const db = require('../util/database');
let SqlString = require('sqlstring'); //global declare
let datetime = require('node-datetime');

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

  static  async donneesStatistiqueRapport(periode) {

     let params=periode.toString().split('=')
     let plateforme=''; let periodAnnee;
     let sqlPlateforme = '';

     if(periode.toString().split('&')){
       plateforme=periode.toString().split('&')[1];
       periodAnnee=periode.toString().split('&')[0];
       periodAnnee=periodAnnee.split('=');
     } else {
       periodAnnee=params;
     }

     let annees='',i=1;

     while(i < periodAnnee.length){
       if(periodAnnee[i]!=''){
         annees +=periodAnnee[i];
         if(i<periodAnnee.length-2){
           annees +=',';
         }
       }
       i++
     }

    if(plateforme!=='vide'){
      let platformes=plateforme.split(',');
      if(platformes.length>0){
        sqlPlateforme=" AND ( ";
        for (let i=0;i<platformes.length;i++){
          sqlPlateforme+="  `tbl_statistiques`.plateforme LIKE'%" + platformes[i].toString() + "%' ";
          if(i<platformes.length-1){
            sqlPlateforme+=" OR ";
          }
        }
        sqlPlateforme+=" )";
      } else {
        sqlPlateforme=" AND `tbl_statistiques`.plateforme LIKE'%" + plateforme.toString() + "%'";
      }

    }
    //console.log(annees);
    /*let sql = "SELECT titre,ISSN,EISSN,statut,abonnement,bdd,domaine,secteur,fournisseur,tbl_periodiques.idRevue as idP,annee,Total_Item_Requests,Unique_Item_Requests,No_License, citations , articlesUdem,  JR4COURANT,  JR4INTER,  JR4RETRO,  JR3OAGOLD,plateforme FROM `tbl_periodiques` LEFT JOIN tbl_statistiques ON tbl_periodiques.idRevue=tbl_statistiques.idRevue where annee IN ("+ annees.toString() +") "+ sqlPlateforme +" order by idP ";
    console.log('sql: ', SqlString.format(sql));*/
    return  db.execute("SELECT titre,ISSN,EISSN,statut,abonnement,bdd,domaine,secteur,fournisseur,tbl_periodiques.idRevue as idP,annee,Total_Item_Requests,Unique_Item_Requests,No_License, citations , articlesUdem,  JR4COURANT,  JR4INTER,  JR4RETRO,  JR3OAGOLD,plateforme FROM `tbl_periodiques` LEFT JOIN tbl_statistiques ON tbl_periodiques.idRevue=tbl_statistiques.idRevue where annee IN ("+ annees.toString() +") "+ sqlPlateforme +" order by idP, annee ");
  }


};

