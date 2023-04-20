const db = require('../util/database');
let SqlString = require('sqlstring'); //global declare
let datetime = require('node-datetime');

module.exports = class ListeStatistique {
  constructor() {

  }


  static fetchAll(annee) {
    //afficher la requette
    /* let sql = "SELECT idStatistique,annee,tbl_statistiques.idRevue as idP,Total_Item_Requests,No_License,citations,articlesUdem,titre,tbl_statistiques.dateA as date FROM tbl_statistiques INNER JOIN tbl_periodiques ON tbl_statistiques.idRevue=tbl_periodiques.idRevue where annee = ?"
    console.log('sql: ', SqlString.format(sql,[annee]));*/
    return db.execute('SELECT idStatistique,annee,tbl_statistiques.idRevue as idP,Total_Item_Requests,Unique_Item_Requests,No_License,citations,articlesUdem,tbl_periodiques.titre as titreP,tbl_statistiques.plateforme as plateforme,tbl_statistiques.dateA as dateA,tbl_statistiques.dateM as dateM,statut,abonnement,ISSN,EISSN,domaine,secteur FROM tbl_statistiques INNER JOIN tbl_periodiques ON tbl_statistiques.idRevue=tbl_periodiques.idRevue where annee = ? order by idP ',[annee]);
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
    if(plateforme){
      sqlPlateforme=" AND `tbl_statistiques`.plateforme LIKE'%" + plateforme.toString() + "%'"
    }
    //console.log(annees);
    /*let sql = "SELECT titre,ISSN,EISSN,statut,abonnement,bdd,domaine,fournisseur,tbl_periodiques.idRevue as idP,annee,Total_Item_Requests,Unique_Item_Requests,No_License, citations , articlesUdem,  JR5COURANT,  JR5INTER,  JR5RETRO,  JR3OAGOLD,plateforme FROM `tbl_periodiques` LEFT JOIN tbl_statistiques ON tbl_periodiques.idRevue=tbl_statistiques.idRevue where annee IN ("+ annees.toString() +") "+ sqlPlateforme +" order by idP ";
    console.log('sql: ', SqlString.format(sql))*/
    return  db.execute("SELECT titre,ISSN,EISSN,statut,abonnement,bdd,domaine,fournisseur,tbl_periodiques.idRevue as idP,annee,Total_Item_Requests,Unique_Item_Requests,No_License, citations , articlesUdem,  JR5COURANT,  JR5INTER,  JR5RETRO,  JR3OAGOLD,plateforme FROM `tbl_periodiques` LEFT JOIN tbl_statistiques ON tbl_periodiques.idRevue=tbl_statistiques.idRevue where annee IN ("+ annees.toString() +") "+ sqlPlateforme +" order by idP, annee ");
  }


};

