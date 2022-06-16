const db = require('../util/database');
let SqlString = require('sqlstring'); //global declare
let datetime = require('node-datetime');
let Sushi=require('./update-statistique');

module.exports = class InCites {
  constructor() {

  }

  static async post(InCites) {
    //creation de la date
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');
    //ajouter la date dans le tableau des données
    InCites.push(date);
    //afficher la requette
    /*let sql = "INSERT INTO tbl_incites SET id_incites=?,annee = ?,Name = ?,ArticlesUdeM =?,Citations =?,Rank=?,DocsCited =?,ISSN =?,EISSN =?,PublisherAll =?,PublisherUnified =?,dateA =? "
    console.log('sql: ', SqlString.format(sql,[InCites]));*/
    let count= await db.execute("SELECT COUNT(id_incites) AS count FROM tbl_incites  WHERE Name=? AND  annee=? ",[InCites[2],InCites[1]])
    //console.log(count[0]['0']['count'])
    if(count[0]['0']['count']>0){
     /* let sql = "UPDATE tbl_incites SET ArticlesUdeM =?,Citations =?,ISSN =?,EISSN =?,dateM =? WHERE Name=? AND  annee=?  "
      console.log('sql: ', SqlString.format(sql,[InCites[3],InCites[4],InCites[5],InCites[6],date,InCites[2],InCites[1]]));*/
      return db.execute('UPDATE tbl_incites SET ArticlesUdeM =?,Citations =?,ISSN =?,EISSN =?,dateM =? WHERE Name=? AND  annee=?  ', [InCites[3],InCites[4],InCites[5],InCites[6],date,InCites[2],InCites[1]] );
    }
    else {
      return db.execute('INSERT INTO tbl_incites SET id_incites=?, annee = ?,Name = ?,ArticlesUdeM =?,Citations =?,ISSN =?,EISSN =?,dateA =? ', InCites );
    }

  }
  static async update(annee) {
    //creation de la date
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');
    let donnees,idRevue,ISSN='',EISSN='',ArticlesUdeM='0',Citations='0',action='',Name,count=0
    //recouperation des données selon l'année
    donnees= await db.execute("SELECT ISSN,EISSN,Name,ArticlesUdeM,Citations  FROM tbl_incites  WHERE annee=?  ",[annee])
   // console.log(donnees[0])
    for(let d of donnees[0]){
      //console.log(d.ISSN)
      if(d.Name){
        Name=d.Name
          if(d.ISSN)
            ISSN=d.ISSN
          if(d.EISSN)
          EISSN=d.EISSN
          if(d.ArticlesUdeM)
          ArticlesUdeM=d.ArticlesUdeM
          if(d.Citations)
          Citations=d.Citations

          idRevue=await Sushi.recouperationIdRevue(ISSN,EISSN,Name,'inCites')
          if(idRevue>0){
              //verifier si l'idRevue existe dans la table statistique pour definir l'action
              action= await db.execute("SELECT idRevue  FROM tbl_statistiques  WHERE idRevue= "+idRevue+" AND annee=?  ",[annee])
             if(action[0]['0']){
                /*let sql = "UPDATE tbl_statistiques SET articlesUdem=?,citations=?,dateM=?   WHERE idRevue= "+idRevue+" AND annee=?"
                console.log('sql: ', SqlString.format(sql,[ArticlesUdeM,Citations,date,annee]));*/
                await db.execute("UPDATE tbl_statistiques SET articlesUdem=?,citations=?,dateM=?   WHERE idRevue= "+idRevue+" AND annee=?",[ArticlesUdeM,Citations,date,annee])
              }
            else {
                await db.execute("INSERT INTO tbl_statistiques SET idRevue=?,annee=?, articlesUdem=?,citations=?,dateA=? ",[idRevue,annee,ArticlesUdeM,Citations,date])
              }
            count++
          }
      }
    }
    return [count]

  }


};

