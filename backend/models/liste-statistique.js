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
    return db.execute('SELECT idStatistique,annee,tbl_statistiques.idRevue as idP,Total_Item_Requests,Unique_Item_Requests,No_License,citations,articlesUdem,tbl_periodiques.titre as titreP,tbl_statistiques.plateforme as plateforme,tbl_statistiques.dateA as date,tbl_statistiques.dateM as dateMod,statut,abonnement,ISSN,EISSN,domaine,secteur FROM tbl_statistiques INNER JOIN tbl_periodiques ON tbl_statistiques.idRevue=tbl_periodiques.idRevue where annee = ? order by idP ',[annee]);
  }

  static  async donneesStatistiqueRapport(periode) {

     let params=periode.toString().split('=')
     let plateforme=''
     if(periode.toString().split('&')){
       plateforme=periode.toString().split('&')[1];
     }

     let annees=[],i=1
     let statistiques=[]

     while(i < params.length){
       if(params[i]!=''){
         annees.push(params[i])
       }
       i++
     }
     statistiques= await this.rapportStatistiquePeriode(annees,plateforme)

    return [statistiques]
  }

  //fonction pour les rapport d'un seul année
  static async rapportStatistiquePeriode(annees,plateforme) {
    let sqlAnnees='( '
    let sqlPlateforme = ''
    // This is the modern method to clone an array in Javascript
    const cloneAnnees =[].concat(annees)
    let lenthClone = cloneAnnees.length;
    //chercher les données statistiques selon une periodes compris par annees
    for(let k=0; k<annees.length;k++) {
      sqlAnnees+=' annee=? ';
      cloneAnnees[lenthClone + k] = annees[k];

      if( k!=annees.length-1 ){
        sqlAnnees+=' OR ';
      }
    }

    if(plateforme){
      sqlPlateforme=" AND `tbl_statistiques`.plateforme LIKE'%" + plateforme + "%'"
    }
    sqlAnnees+='  )';
    //console.log(cloneAnnees)
    /*let sql = "SELECT titre,ISSN,EISSN,statut,abonnement,bdd,domaine,tbl_periodiques.idRevue as idP, sum(Total_Item_Requests) as Total_Item_Requests, SUM(Unique_Item_Requests) AS Unique_Item_Requests, SUM(No_License) AS No_License, SUM(citations) AS citations , SUM(articlesUdem) AS articlesUdem, sum(JR5COURANT) as JR5COURANT, sum(JR5INTER) as JR5INTER, sum(JR5RETRO) as JR5RETRO,(SELECT GROUP_CONCAT(plateforme, ' ') from `tbl_statistiques` WHERE `idRevue` = idP and "+ sqlAnnees +" ) as plateforme FROM `tbl_periodiques` LEFT JOIN tbl_statistiques ON tbl_periodiques.idRevue=tbl_statistiques.idRevue where "+ sqlAnnees +" "+ sqlPlateforme +" GROUP BY tbl_periodiques.idRevue order by tbl_periodiques.idRevue ";
    console.log('sql: ', SqlString.format(sql,cloneAnnees))*/
    return  db.execute("SELECT titre,ISSN,EISSN,statut,abonnement,bdd,domaine,tbl_periodiques.idRevue as idP, sum(Total_Item_Requests) as Total_Item_Requests, SUM(Unique_Item_Requests) AS Unique_Item_Requests, SUM(No_License) AS No_License, SUM(citations) AS citations , SUM(articlesUdem) AS articlesUdem, sum(JR5COURANT) as JR5COURANT, sum(JR5INTER) as JR5INTER, sum(JR5RETRO) as JR5RETRO,(SELECT GROUP_CONCAT(plateforme, ' ') from `tbl_statistiques` WHERE `idRevue` = idP and "+ sqlAnnees +"  ) as plateforme FROM `tbl_periodiques` LEFT JOIN tbl_statistiques ON tbl_periodiques.idRevue=tbl_statistiques.idRevue where "+ sqlAnnees +" "+ sqlPlateforme +" GROUP BY tbl_periodiques.idRevue order by tbl_periodiques.idRevue ",cloneAnnees);
  }

  static  async statistiquesRapportPlateforme(periode) {

    let params=periode.toString().split('=')
    let annees=[],i=1
    let statistiques=[]

    let plateforme=''
    if(periode.toString().split('&')){
      plateforme=periode.toString().split('&')[1];
    }

    while(i < params.length){
      if(params[i]!=''){
        annees.push(params[i])
      }
      i++
    }
    statistiques= await this.rapportStatistiquePlateforme(annees,plateforme)

    return [statistiques]
  }

  //fonction pour les rapport d'un seul année
  static async rapportStatistiquePlateforme(annees,plateforme) {
    let i=0
    let anneesString='',sqlAnnees='',sqlPlateforme=''
    let statistiques=[]
    anneesString=''
    //chercher les données statistiques selon une periodes compris par annees
    for(let k=0; k<annees.length;k++) {
      anneesString += annees[k] + ','
      sqlAnnees+=" annee=? "
      if(k!=annees.length-1){
        sqlAnnees+=" OR "
      }
    }
    if(plateforme){
      sqlPlateforme=" AND `tbl_statistiques`.plateforme LIKE'%" + plateforme + "%'"
    }

    return  db.execute('SELECT titre,ISSN,EISSN,statut,abonnement,bdd,domaine,plateforme,tbl_periodiques.idRevue as idP,  Total_Item_Requests,  Unique_Item_Requests,  No_License,  citations , articlesUdem,  JR5COURANT,  JR5INTER,  JR5RETRO, tbl_statistiques.dateA as dateAS, tbl_statistiques.dateM as dateMS FROM `tbl_periodiques` LEFT JOIN tbl_statistiques ON tbl_periodiques.idRevue=tbl_statistiques.idRevue where ('+sqlAnnees+') ' +sqlPlateforme+ ' order by tbl_periodiques.idRevue ',annees);

  }

};

