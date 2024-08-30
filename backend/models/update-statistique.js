const db = require('../util/database');
const axios = require('axios');
let SqlString = require('sqlstring'); //global declare
const datetime = require("node-datetime");

module.exports = class Sushi {
  constructor() {
  }

  static async  getAllStatistique(annee) {
    console.log('Update-statistique:'+annee)
    let rapports=['J1-J2','J3','J4']; let resultat
    try {
      await this.updateStatistique(annee)
      //prendre toutes les donées du sushi pour faire la mise a jour des statistique des périodiques
      for(let rapport of rapports){
        switch (rapport){
          case 'J1-J2':
            await this.statisquesJ1J2(annee)
            break;
          case 'J3': await this.statisquesJ3(annee)
            break;
          case 'J4': await this.statisquesJ4(annee)
            break;
          default:
            return
            break;
        }
        //retourner le nombre des statistique updaté
        let resultat= await  db.execute(' SELECT Count(idStatistique) as count FROM tbl_statistiques where annee = ? ',[annee]);
        //console.log(resultat);
        /*let sql = 'SELECT Count(idStatistique) as count FROM tbl_statistiques where annee = ?';
        console.log('sql: ', SqlString.format(sql,[annee]));
        console.log(resultat[0]['0']['count']);*/
        if(resultat[0]['0']['count']){
          return [resultat[0]['0']['count']];
        } else {
          return ['plusieurs'];
        }

      }

    } catch (error) {
      // console.error(error);
    }
  }

  //inserer les donnée pour J1
  static async statisquesJ1J2(annee){
    let donneesExist,dt,dateNow,totalRequest,idRevue,rapport;
    let typeDonnees=['Total_Item_Requests','Unique_Item_Requests','No_License'];
    try {
      let table='tbl_results_j1';
      rapport='J1'
      for(let t of typeDonnees){
        if(t=='No_License'){
          table='tbl_results_j2'
          rapport='J2'
        }


        let donnees= await db.execute("SELECT ISSN,EISSN,Title,Reporting_Period_Total,PlatformID  FROM "+table+"  WHERE annee=? AND Metric_Type=? ",[annee,t])
        //inserer le Total_Item_Requests dans la table statisque de cette periodique
        for(let chiffre of donnees[0]){
          //prendre l'idRvue
          idRevue= await this.recouperationIdRevue(chiffre.ISSN,chiffre.EISSN,chiffre.Title,rapport,chiffre.PlatformID,annee)
          //console.log(idRevue)
          if(idRevue!=-1){
            //verifier si ce periodique as deja des données dans statistique pour cette annee
            donneesExist= await this.verifierDonneesExist(annee,idRevue,t)
            dt = datetime.create();
            dateNow = dt.format('Y-m-d H:M:S');
            // console.log(champ)
            if(donneesExist==-1){
              //console.log('add'+champ['idRevue'])
              /*let sql = "INSERT INTO tbl_statistiques SET annee=?,"+t+" =?,dateA=?, idRevue=?"
              console.log('sql: ', SqlString.format(sql,[annee,chiffre.Reporting_Period_Total,dateNow,idRevue]));*/
              await db.execute("INSERT INTO tbl_statistiques SET annee=?,"+t+" =?,dateA=?, idRevue=?,plateforme=?", [annee,chiffre.Reporting_Period_Total,dateNow,idRevue,chiffre.PlatformID] );
            }
            if(donneesExist>=0){
             /* totalRequest=0
              /*let sql = "UPDATE tbl_statistiques SET "+t+" =?,dateM=? where idRevue=? AND annee=?"
              console.log('sql: ', SqlString.format(sql,[totalRequest.toString(),dateNow,idRevue,annee]));*/
              /*totalRequest=Number(donneesExist)+Number(chiffre.Reporting_Period_Total)*/
              //console.log(totalRequest)*/
              await db.execute("UPDATE tbl_statistiques SET "+t+" =?,plateforme=?,dateM=? where idRevue=? AND annee=?", [chiffre.Reporting_Period_Total,chiffre.PlatformID,dateNow,idRevue,annee] );

            }
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  //inserer les donnée pour J3
  static async statisquesJ3(annee){
    let donnees;
    let table='tbl_results_j3'
    let champJR=['JR3OAGOLD']
    try {
      donnees= await db.execute("SELECT DISTINCT (Title) AS titre,ISSN,EISSN,PlatformID FROM "+table+"  WHERE annee=? AND Metric_Type=? ",[annee,'Total_Item_Requests'])
      //inserer le Total_Item_Requests du j3 comme champ separé dans la table statisque de cette periodique
      for(let chiffre of donnees[0]){
        //console.log(donneesJR)
        //prendre l'idRvue
        let idRevue= await this.recouperationIdRevue(chiffre.ISSN,chiffre.EISSN,chiffre.titre,'J3',chiffre.PlatformID,annee)
        //console.log(idRevue)
        if(idRevue!=-1){
          //verifier si ce periodique as deja des données dans statistique pour cette annee
            let donneesExist= await this.verifierDonneesExist(annee,idRevue,champJR)
            let dt = datetime.create();
            let dateNow = dt.format('Y-m-d H:M:S');
            // console.log(champ)
            if(donneesExist=='-1'){
              //console.log('add'+champ['idRevue'])
               let sql = "INSERT INTO tbl_statistiques SET annee=?,plateforme=?,JR3OAGOLD =?,dateA=?, idRevue=?"
               console.log('sql: ', SqlString.format(sql,[annee,chiffre.PlatformID,chiffre.Total_Item_Requests,dateNow,idRevue]));
              await db.execute("INSERT INTO tbl_statistiques SET annee=?,plateforme=?,JR3OAGOLD =?,dateA=?, idRevue=?", [annee,chiffre.PlatformID,chiffre.Total_Item_Requests,dateNow,idRevue] );
            }
            if(donneesExist>='0'){

               let sql = "UPDATE tbl_statistiques SET JR3OAGOLD =?,dateM=? where idRevue=? AND annee=?"
               console.log('sql: ', SqlString.format(sql,[chiffre.Total_Item_Requests,dateNow,idRevue,annee]));
              //totalRequest=Number(donneesExist)+Number(donneesJR[j])
              //console.log(totalRequest)
              await db.execute("UPDATE tbl_statistiques SET JR3OAGOLD =?,dateM=? where idRevue=? AND annee=?", [chiffre.Total_Item_Requests,dateNow,idRevue,annee] );

            }

        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  //inserer les donnée pour J4
  static async statisquesJ4(annee){
    let totalRequest,donnees;
    let donneesJR=[]
    let table='tbl_results_j4'
    let champJR=['JR4COURANT','JR4INTER','JR4RETRO']
    try {
      donnees= await db.execute("SELECT DISTINCT (Title) AS titre,ISSN,EISSN,PlatformID FROM "+table+"  WHERE annee=? AND Metric_Type=? ",[annee,'Total_Item_Requests'])
      //inserer le Total_Item_Requests dans la table statisque de cette periodique
      for(let chiffre of donnees[0]){
        //prendre l'idRvue
        donneesJR= await this.calculerJR(chiffre.ISSN,chiffre.EISSN,chiffre.titre,annee)

        //prendre l'idRvue
        let idRevue= await this.recouperationIdRevue(chiffre.ISSN,chiffre.EISSN,chiffre.titre,'J4',chiffre.PlatformID,annee)
        //console.log(idRevue)
        if(idRevue!=-1){
          //verifier si ce periodique as deja des données dans statistique pour cette annee

          for(let j of champJR){
            let donneesExist= await this.verifierDonneesExist(annee,idRevue,j)
            let dt = datetime.create();
            let dateNow = dt.format('Y-m-d H:M:S');

            if(donneesExist=='-1'){
              //console.log('add'+champ['idRevue'])
              /* let sql = "INSERT INTO tbl_statistiques SET annee=?,"+j+" =?,dateA=?, idRevue=?"
               console.log('sql: ', SqlString.format(sql,[annee,donneesJR[j],dateNow,idRevue]));*/
              await db.execute("INSERT INTO tbl_statistiques SET annee=?,plateforme=?,"+j+" =?,dateA=?, idRevue=?", [annee,chiffre.PlatformID,donneesJR[j],dateNow,idRevue] );
            }
            if(donneesExist>='0'){
             /* totalRequest=0
              /*let sql = "UPDATE tbl_statistiques SET "+j+" =?,dateM=? where idRevue=? AND annee=?"
              console.log('sql: ', SqlString.format(sql,[donneesJR[j],dateNow,idRevue,annee]));*/
              //totalRequest=Number(donneesExist)+Number(donneesJR[j])
              //console.log(totalRequest)*/
              await db.execute("UPDATE tbl_statistiques SET "+j+" =?,plateforme=?,dateM=? where idRevue=? AND annee=?", [donneesJR[j],chiffre.PlatformID,dateNow,idRevue,annee] );

            }

          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  //faire un select avant de définir l'action
  static async verifierDonneesExist(annee, idRevue, Metric_Type) {
    const sql = `SELECT ${Metric_Type} AS total FROM tbl_statistiques WHERE idRevue = ? AND annee = ?`;
    const [rows] = await db.execute(sql, [idRevue, annee]);
    return rows.length > 0 ? rows[0].total : -1;
  }

  //vider la table statistique pour un année donnée avant d'inserer les nouveau data
  static async updateStatistique(annee){
    await db.execute("UPDATE tbl_statistiques SET Total_Item_Requests='0',Unique_Item_Requests='0',No_License='0',JR4COURANT='0',JR4INTER='0',JR4RETRO='0'  WHERE  annee=?  ",[annee])
  }

  //recouperer l'id de la revue
  static async recouperationIdRevue(ISSN,EISSN,Title,rapport,PlatformID,annee){
    let idRevue

    // idRevue=await db.execute("SELECT idRevue FROM tbl_periodiques WHERE  titre LIKE ? OR  ISSN=? OR EISSN=?",[Title,ISSN,EISSN])
      idRevue=await db.execute("SELECT idRevue FROM tbl_periodiques WHERE  ( ISSN =? OR  EISSN=? ) OR  ( ISSN =? OR  EISSN=? )",[ISSN,EISSN,EISSN,ISSN])
    if(idRevue[0]!=''){
      return idRevue[0]['0']['idRevue']
    }
    else {
      let dt = datetime.create();
      let dateNow = dt.format('Y-m-d H:M:S');
      let id_log=await db.execute("SELECT id_log FROM lst_logsrevues WHERE Title like ? and annee= ?    ",[Title,annee])
      if(id_log[0]==''){
        //Inserer les periodiques non trouvé dans la matrice, mais existant dans les rapport soushi
        /*let sql = "INSERT INTO lst_logsrevues SET ISSN=?,EISSN =?,Title =?,rapport=?,note=?,dateA=?,dateM=''"
        console.log('sql: ', SqlString.format(sql,[ISSN,EISSN,Title,rapport,'Périodique trouvé dans les rapport sushi',dateNow]));*/
        await db.execute("INSERT INTO lst_logsrevues SET ISSN=?,EISSN =?,Title =?,rapport=?,PlatformID=?,annee=?,note=?,dateA=?,dateM=''", [ISSN,EISSN,Title,rapport,PlatformID,annee,'Périodique non-trouvé rapport sushi',dateNow] );
      }
      return -1
    }

  }

  //calculer les JR5 parametres
  static async calculerJR(ISSN,EISSN,Title,annee){
    let JR4COURANT,JR4INTER,JR4RETRO
    let JR5=[],resultat=[]
    if(ISSN==''&& EISSN==''){
      JR5=await db.execute("SELECT * FROM tbl_results_j4 WHERE  Title LIKE ? ",[Title])
    }
    if(ISSN==''&& EISSN!=''){
      JR5=await db.execute("SELECT * FROM tbl_results_j4 WHERE EISSN=? or Title LIKE ? ",[EISSN,Title])
    }
    if(ISSN!=''&& EISSN==''){
      JR5=await db.execute("SELECT * FROM tbl_results_j4 WHERE ISSN=? or Title LIKE ? ",[ISSN,Title])
    }
    if(ISSN!=''&& EISSN!='')
      JR5=await db.execute("SELECT * FROM tbl_results_j4 WHERE  ISSN=? and  EISSN=?     ",[ISSN,EISSN])
    //initialisation des jr données
    JR4COURANT=0
    JR4INTER=0
    JR4RETRO=0
    //calculer les valeur de JR5
    for(let j of JR5[0]){

      if(j.YOP>=(annee-2)){
        if(j.Metric_Type=='Total_Item_Requests')
          JR4COURANT=j.Reporting_Period_Total
      }
      if((annee-2)>j.YOP>(annee-12)){
        if(j.Metric_Type=='Total_Item_Requests')
          JR4INTER+=Number(j.Reporting_Period_Total)
      }
      if(j.YOP<=(annee-12)){
        if(j.Metric_Type=='Total_Item_Requests')
          JR4RETRO+=Number(j.Reporting_Period_Total)
      }

    }

    resultat['JR4COURANT']=JR4COURANT

    resultat['JR4INTER']=JR4INTER

    resultat['JR4RETRO']=JR4RETRO

    return resultat
  }

};
