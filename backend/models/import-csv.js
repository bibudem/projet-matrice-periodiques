const db = require('../util/database');
let SqlString = require('sqlstring'); //global declare
let datetime = require('node-datetime');
let Sushi=require('./update-statistique');
const {delay} = require("rxjs");

module.exports = class InCites {
  constructor() {

  }

  static async post(InCites) {
    //creation de la date
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');
    const tabValue = [];
    let condSql = '';
    let count=0;

    if(InCites[1]!='-'){
      condSql += ', annee = ?';
      tabValue.push(InCites[1]);
    }
    if(InCites[2]!='-'){
      condSql += ', Name = ?';
      tabValue.push(InCites[2]);
    }
    if(InCites[3]!='-'){
      condSql += ', ArticlesUdeM = ?';
      tabValue.push(InCites[3]);
    }
    if(InCites[4]!='-'){
      condSql += ', Citations = ?';
      tabValue.push(InCites[4]);
    }
    if(InCites[5]!='-'){
      condSql += ', ISSN = ?';
      tabValue.push(InCites[5]);
    }
    if(InCites[6]!='-'){
      condSql += ', EISSN = ?';
      tabValue.push(InCites[6]);
    }
    // supprimer ',' du debut de la condition
    condSql = condSql.slice(1);
    //ajouter la date dans le tableau des données
    tabValue.push(date);

    let id_incites= await db.execute("SELECT id_incites AS id FROM tbl_incites  WHERE (Name=? or ISSN =? or EISSN =?) AND  annee=? LIMIT 0,1",[InCites[2],InCites[5],InCites[6],InCites[1]])

    if(id_incites[0].length>0){
      id_incites=id_incites[0]['0']['id'];
      tabValue.push(id_incites);
      count++;
     /* let sql = "UPDATE tbl_incites SET ArticlesUdeM =?,Citations =?,ISSN =?,EISSN =?,dateM =? WHERE Name=? AND  annee=?  "
      console.log('sql: ', SqlString.format(sql,[InCites[3],InCites[4],InCites[5],InCites[6],date,InCites[2],InCites[1]]));*/
      await db.execute('UPDATE tbl_incites SET '+condSql+' ,dateM=? WHERE id_incites=?  ', tabValue );
    }
    else {
      count++;
       tabValue.push(0);
      await  db.execute('INSERT INTO tbl_incites SET  '+condSql+' ,dateA=?, id_incites=?', tabValue );
    }
     return [count];
  }
  static async update(annee) {
    //creation de la date
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');
    let donnees,idRevue,ISSN='',EISSN='',ArticlesUdeM='0',Citations='0',action='',Name,count=0;
    let i=0;
    //recouperation des données selon l'année
    donnees= await db.execute("SELECT ISSN,EISSN,Name,ArticlesUdeM,Citations  FROM tbl_incites  WHERE annee=?  ",[annee])
     //console.log(donnees[0])
    for(let d of donnees[0]){
      i++;
      const tabValue = [];
      let condSql = '';
      if(d.ArticlesUdeM){
        condSql += ', ArticlesUdeM = ?';
        tabValue.push(d.ArticlesUdeM);
      }
      if(d.Citations){
        condSql += ', Citations = ?';
        tabValue.push(d.Citations);
      }

      // si tous les champs sont '-'
      if(condSql==''){
        return []
      }
      // supprimer ',' du debut de la condition
      condSql = condSql.slice(1);

      tabValue.push(date);
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

          idRevue=await this.recouperationIdRevue(ISSN,EISSN,Name,annee);
          //console.log(idRevue);
          if(idRevue>0){
             count++;
              //verifier si l'idRevue existe dans la table statistique pour definir l'action
              /*let sql = "SELECT idRevue  FROM tbl_statistiques  WHERE idRevue= ? AND annee=? "
              console.log('sql: ', SqlString.format(sql,[idRevue,annee]));*/
              action= await db.execute("SELECT idRevue  FROM tbl_statistiques  WHERE idRevue= ? AND annee=?  ",[idRevue,annee])
             if(action[0].length>0){
                tabValue.push(idRevue);
                tabValue.push(annee);
                /*let sql = "UPDATE tbl_statistiques SET " + condSql + " ,dateM=?   WHERE idRevue= ? AND annee=?"
                console.log('sql: ', SqlString.format(sql,tabValue));*/
                await db.execute("UPDATE tbl_statistiques SET " + condSql + " ,dateM=?   WHERE idRevue= ? AND annee=?",tabValue)
              }
            else {
                tabValue.push(0);
                tabValue.push(annee);
                await db.execute("INSERT INTO tbl_statistiques SET  " + condSql + " ,dateA=?,idRevue=?,annee=? ",tabValue)
              }

          }
      }
      //mettre une pause
      await this.sleep();
        //console.log('This printed after'+i);

    }
    console.log(count)
    return [count]

  }

  static async sleep(){
    // prevent the statement in the callback function of
    setTimeout(function(){
    }, 200);
  }

  //recouperer l'id de la revue
  static async recouperationIdRevue(ISSN,EISSN,Title,annee){
    let idRevue=-1;
    //Inserer les periodiques non trouvé dans la matrice, mais existant dans les rapport soushi
    let id=await db.execute("SELECT idRevue FROM tbl_periodiques WHERE  ( ISSN =? OR  EISSN=? ) OR  ( ISSN =? OR  EISSN=? ) order by idRevue LIMIT 0,1 ",[ISSN,EISSN,EISSN,ISSN]);
    //console.log(id[0].length);
    if(id[0].length>0){
      idRevue = id[0]['0']['idRevue'];
    }
    else {
      let dt = datetime.create();
      let dateNow = dt.format('Y-m-d H:M:S');
      let id_log=await db.execute("SELECT id_log FROM lst_logsrevues WHERE Title like ? and annee= ? and  ISSN=? and EISSN =?   ",[Title,annee,ISSN,EISSN])
      if(id_log[0].length==0){
        //Inserer les periodiques non trouvé dans la matrice, mais existant dans les rapport soushi
        /*let sql = "INSERT INTO lst_logsrevues SET ISSN=?,EISSN =?,Title =?,rapport=?,annee=?,note=?,dateA=?";
        console.log('sql: ', SqlString.format(sql,[ISSN,EISSN,Title,'inCites',annee,'Périodique non-trouvé rapport',dateNow]));*/
        await db.execute("INSERT INTO lst_logsrevues SET ISSN=?,EISSN =?,Title =?,rapport=?,annee=?,note=?,dateA=?", [ISSN,EISSN,Title,'inCites',annee,'Périodique non-trouvé rapport',dateNow] );
      }
    }
    return idRevue;
  }
};

