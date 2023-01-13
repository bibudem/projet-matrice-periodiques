const db = require('../util/database');
let SqlString = require('sqlstring'); //global declare
let Plateforme = require('./plateforme');
const datetime = require("node-datetime");
let LocalStorage = require('node-localstorage').LocalStorage,
  localStorage = new LocalStorage('./scratch');

// Configurer le proxy pour un serveur non publié a l'externe
const axios = require('axios');
const HttpsProxyAgent = require('https-proxy-agent')


module.exports = class Sushi {
  constructor() {
  }

   static async  fetchAll(dateParams) {
     let reponse,url; let filtrePlateforme='';
    //extraire les dates du request
     let params=dateParams.split('=')
     let date='begin_date='+params[1]+'&end_date='+params[2]
     let begin_date=params[1]
     //extraire l'annee selecté
     let anneePost=begin_date.split('-')[0]

     //recouperation du filtre plateforme
     if(params[3]){
       filtrePlateforme=params[3];
     }
     //creation de la date actuelle
     let dt = datetime.create();
     let dateNow = dt.format('Y-m-d H:M:S');
     let resultat= {},count=0
     try {
       let plateformes = await Plateforme.fetchAll();
       for (const api of plateformes[0]) {
         //verifier si url exist
        if(api.SUSHIURL){
          //inclure le filtre
          if(filtrePlateforme!=''&&filtrePlateforme!=api.PlatformID) {
            reponse='-1'; }

          if(filtrePlateforme!=''&&filtrePlateforme==api.PlatformID){
            reponse = await this.reponseUrl(api, date)
          }
          //sans filtre par plateforme
          if(filtrePlateforme=='') {
            reponse = await this.reponseUrl(api, date)
          } //gestion du reponse
          if(typeof(reponse)=='string' && reponse!='-1') {
            //inserer les logs
            //console.log(reponse)
            await this.insertLogs('SUSHI-URL-Error', api.PlatformID,localStorage.getItem('url'), 'Error', reponse.split('-')[1], 'admin', dateNow,anneePost)
            //return ('Le reponse du SUSHI est vide')
          }
          if(typeof(reponse)=='object') {
                 for (const [rapport, valObjet] of Object.entries(reponse)) {
                   //chercher les données d'url formé
                   for (const [key, value] of Object.entries(valObjet)) {
                     //trouver les reponse avec error pour souvegarder dans la tablea log
                     if (key == 'Exceptions') {
                       await this.insertLogs('SUSHI-data-info' + rapport, api.PlatformID,localStorage.getItem('url'), 'Error', 'Exceptions', 'admin', dateNow,anneePost)
                     }
                     if (key == 'Report_Items') {
                       if (value != '') {
                         //tratement des données dans l'url
                         await this.donnesRequest(value, api, anneePost, rapport)
                         count++
                       }
                     }
                   }

                 }

               }

             }

        }
         return [count];

     } catch (error) {
       console.error(error);
     }
  }

  //fonction qui cherche les données selon l'url passé
  static async reponseUrl(api,date){
    try{
        const agent = new HttpsProxyAgent('http://mandataire.ti.umontreal.ca:80');
        //creation d'url pour chaque plateforme
        let values=['j1','j2','j3','j4'];
        let url; let reponse;let resultat=[]
        localStorage.setItem('url','');
        for(let rapport of values){
          url=api.SUSHIURL
          url+='/reports/tr_'+rapport+'/'
          if(api.ConsortiumRequestorID){
            url+='?requestor_id='+api.ConsortiumRequestorID;
          }
          if(api.ConsortiumCustID){
            if(!api.ConsortiumRequestorID)
              url+='?customer_id='+api.ConsortiumCustID;
            else
            url+='&customer_id='+api.ConsortiumCustID;
          }
          if(api.ConsortiumApiKey){
            url+='&api_key='+api.ConsortiumApiKey;
          }
          url+='&'+date;
          localStorage.setItem('url',url);

          ///avec proxy, mais plus besoin si on defini proxy global
          /*reponse = await axios.get(url,{
            httpsAgent: agent,
            keepAlive: true,
            timeout: 360000000,
          });*/
          //console.log(reponse.data);
          reponse = await axios.get(url);
          resultat[rapport]=reponse.data

        }
        //console.log(resultat)
        return resultat;
    }catch (e) {
        console.log('error axios'+e)
        return 'error-'+e
    }
  }

  //recouperation des données pour les rapport j1,j2,j3,j4
  static async donnesRequest(value,api,anneePost,rapport){
    //chercher les chiffres par mois et calculer le total
    let Title,chiffresT,chiffresU,chiffresN,
      totalRequest,uniqueRequest,noLicence,mois
    let EISSN,ISSN; let performAnnee=[]
    //creation de la date actuelle
    let dt,dateNow;

    try {
      for (const data of value) {
        Title=data.Title;
        if(data["Access_Type"]){
          //console.log(data["Access_Type"]);
          console.log(rapport);
        }
          if(rapport=='j3' && data["Access_Type"]=='Controlled'){
            console.log(data["Access_Type"]);
            break;
          }
              if(data["Performance"]){
                uniqueRequest=0;totalRequest=0;noLicence=0;
                chiffresT=[];chiffresU=[];chiffresN=[];
                dt = datetime.create();
                dateNow = dt.format('Y-m-d H:M:S');
                for (const performance of data.Performance) {
                  for(const inst of performance.Instance){
                    //extraire les chiffres pour chaque periodique
                    mois=performance.Period["Begin_Date"].split('-')[1].toString()
                    switch (inst.Metric_Type){
                      case "Unique_Item_Requests" :
                        chiffresU['m'+mois]=Number(inst["Count"])
                        uniqueRequest+=Number(inst["Count"])
                        break;
                      case "Total_Item_Requests" :
                        chiffresT['m'+mois]=Number(inst["Count"])
                        totalRequest+=Number(inst["Count"])
                        break;
                      case "No_License" :
                        chiffresN['m'+mois]=Number(inst["Count"])
                        noLicence+=Number(inst["Count"])
                        break;
                    }
                  }

                }
              }
        //chercher les id de la periodique et inserer les données
        EISSN = '';
        ISSN = '';
        if(data["Item_ID"]) {
          //vider le tableau initial
          performAnnee = [];
          for (const per of data["Item_ID"]) {
            if (per["Type"] == 'Online_ISSN')
              EISSN = per["Value"]
            //ISSN
            if (per["Type"] == 'Print_ISSN')
              ISSN = per["Value"]
          }
        }
          //creation du tableau pour Total_Item_Requests
          if(totalRequest!=0){
            performAnnee=[api.PlatformID,ISSN,EISSN,Title]

            if(rapport=='j4'){
              performAnnee.push(data.YOP)
            }
            performAnnee.push("Total_Item_Requests")
            performAnnee.push(anneePost)
            performAnnee.push(totalRequest)
            await this.addToArray(performAnnee,chiffresT)
            performAnnee.push(dateNow)
            //ajout id admin
            performAnnee.push('idAdmin')
            //inserer dans la base des données les Total_Item_Requests
            await this.actionRequest(rapport,performAnnee,anneePost,'Total_Item_Requests')
          }
          //creation du tableau pour Unique_Item_Requests
          if(uniqueRequest!=0){
            //initialiser l'array avec les données commun
            performAnnee=[api.PlatformID,ISSN,EISSN,Title]

            if(rapport=='j4'){
              performAnnee.push(data.YOP)
            }
            performAnnee.push("Unique_Item_Requests")
            performAnnee.push(anneePost)
            performAnnee.push(uniqueRequest)
            await this.addToArray(performAnnee,chiffresU)
            performAnnee.push(dateNow)
            //ajout id admin
            performAnnee.push('idAdmin')
            //inserer dans la base des données les Unique_Item_Requests
            await this.actionRequest(rapport,performAnnee,anneePost,'Unique_Item_Requests')

          }
        //creation du tableau pour No_License
          if(noLicence!=0){
            //initialiser l'array avec les données commun
            performAnnee=[api.PlatformID,ISSN,EISSN,Title]
            performAnnee.push("No_License")
            performAnnee.push(anneePost)
            performAnnee.push(noLicence)
            await this.addToArray(performAnnee,chiffresN)
            performAnnee.push(dateNow)
            //ajout id admin
            performAnnee.push('idAdmin')
            //inserer dans la base des données les No_License
            await this.actionRequest(rapport,performAnnee,anneePost,'No_License')
          }

      }

    }catch (e) {
      console.log('recouperation données '+e)
    }
  }

  //fonction pour insere les donnees
  static async actionRequest(tbl,arrayReponse,anneePost,Metric_Type){

    let table='tbl_results_'+tbl;let action

    let idPlateforme,EISSN,ISSN,YOP,Title

      idPlateforme=arrayReponse[0]
      EISSN=arrayReponse[2]
      ISSN=arrayReponse[1]
      Title=arrayReponse[3]
      YOP=''
      if(tbl=='j4'){
        YOP=arrayReponse[4]
      }

      //verifier si une importation a été fait cette année
    action=await this.verifierDonnes(table,anneePost,idPlateforme,EISSN,ISSN,Title,Metric_Type,YOP)
    //console.log(arrayReponse)
    try{
      switch (action){
        case "add":
         /*let sql1 = "INSERT INTO " + table + " SET PlatformID =?,ISSN =?,EISSN =?,Title=?,Metric_Type =?,annee =?,Reporting_Period_Total =?,m01 =?,m02 =?,m03 =?,m04 =?,m05 =?,m06 =?,m07 =?,m08 =?,m09 =?,m10 =?,m11 =?,m12 =?,dateA =?,admin=? "
          console.log('sql: ', SqlString.format(sql1,arrayReponse));*/
          if(tbl=='j4'){
            db.execute("INSERT INTO "+ table + " SET PlatformID =?,ISSN =?,EISSN =?,Title=?,YOP =?,Metric_Type =?,annee =?,Reporting_Period_Total =?,m01 =?,m02 =?,m03 =?,m04 =?,m05 =?,m06 =?,m07 =?,m08 =?,m09 =?,m10 =?,m11 =?,m12 =?,dateA =?,admin=? ", arrayReponse );
          } else{
            db.execute("INSERT INTO "+ table + " SET PlatformID =?,ISSN =?,EISSN =?,Title=?,Metric_Type =?,annee =?,Reporting_Period_Total =?,m01 =?,m02 =?,m03 =?,m04 =?,m05 =?,m06 =?,m07 =?,m08 =?,m09 =?,m10 =?,m11 =?,m12 =?,dateA =?,admin=? ", arrayReponse );
          }
          break;
        case "save":
          if(tbl!='j4'){
            arrayReponse.push(anneePost)
          }
          arrayReponse.push(idPlateforme)//id de la plateforme
          arrayReponse.push(EISSN)//EISSN
          arrayReponse.push(ISSN)//ISSN
          arrayReponse.push(Metric_Type)
          /*let sql2 = "UPDATE " + table + " SET PlatformID =?,ISSN =?,EISSN =?,Title=?,Metric_Type =?,annee =?,Reporting_Period_Total =?,m01 =?,m02 =?,m03 =?,m04 =?,m05 =?,m06 =?,m07 =?,m08 =?,m09 =?,m10 =?,m11 =?,m12 =?,dateM =?,admin=? WHERE annee=? and PlatformID=? AND  EISSN=? AND ISSN=? AND Metric_Type=? "
          console.log('sql: ', SqlString.format(sql2,arrayReponse));*/
          if(tbl=='j4'){
            arrayReponse.push(YOP)
            db.execute("UPDATE  "+ table +" SET PlatformID =?,ISSN =?,EISSN =?,Title=?,YOP =?,Metric_Type =?,annee =?,Reporting_Period_Total =?,m01 =?,m02 =?,m03 =?,m04 =?,m05 =?,m06 =?,m07 =?,m08 =?,m09 =?,m10 =?,m11 =?,m12 =?,dateM =?,admin=? WHERE  PlatformID=? AND  EISSN=? AND ISSN=? AND Metric_Type=? and YOP=?", arrayReponse );
          } else{
            db.execute("UPDATE  "+ table +" SET PlatformID =?,ISSN =?,EISSN =?,Title=?,Metric_Type =?,annee =?,Reporting_Period_Total =?,m01 =?,m02 =?,m03 =?,m04 =?,m05 =?,m06 =?,m07 =?,m08 =?,m09 =?,m10 =?,m11 =?,m12 =?,dateM =?,admin=? WHERE annee=? and PlatformID=? AND  EISSN=? AND ISSN=? AND Metric_Type=?", arrayReponse );
          }
          break;
        default:
          console.log('error array'+arrayReponse)
      }
    }
    catch (e){
      console.log('insert error:'+e)
    }
  }
  //add les elements d'un tableau dans l'autre, accepter juste 12 elements
  static async addToArray(array1,array2){
    let values=['m01','m02','m03','m04','m05','m06','m07','m08','m09','m10','m11','m12']
      values.forEach(element => {
          if(!array2[element]) array2[element]=0
          array1.push(array2[element])
        }
      );
    return array1
  }
  //faire un select avant de définir l'action
  static async verifierDonnes(table,annee,idPlateforme,EISSN,ISSN,Title,Metric_Type,YOP){
    let action='add';let  count;
    /*let sql = "SELECT  COUNT(*) AS count FROM "+table+"  WHERE annee=? AND PlatformID=? AND (EISSN=? OR ISSN=?) AND Metric_Type=?"
      console.log('sql: ', SqlString.format(sql,[annee,idPlateforme,EISSN,ISSN,Metric_Type]));*/
    if(table=='tbl_results_j4'){
      count= await db.execute("SELECT COUNT(*) AS count FROM "+table+"  WHERE annee=? AND  PlatformID=? AND EISSN=? AND ISSN=? and Title=? AND Metric_Type=? AND YOP =?",[annee,idPlateforme,EISSN,ISSN,Title,Metric_Type,YOP])
    } else {
      count= await db.execute("SELECT COUNT(*) AS count FROM "+table+"  WHERE annee=? AND PlatformID=? AND EISSN=? AND ISSN=? and Title=? AND Metric_Type=? ",[annee,idPlateforme,EISSN,ISSN,Title,Metric_Type])
    }
      if(count[0]['0'].count!=0)
        action='save'
     // console.log(count[0]['0'].count)

    return action
  }
//inserer les logs
  static async insertLogs(type,plateforme,url,error,message,admin,date,annee){
    try {
      let idLog =await db.execute("SELECT idLog  FROM lst_logsplateformes WHERE plateforme= ? and annee= ?",[plateforme,annee])
      if(idLog [0]==''){
        //Inserer les periodiques non trouvé dans la matrice, mais existant dans les rapport soushi
        await db.execute("INSERT INTO lst_logsplateformes SET typeOperation =?,plateforme =?,url=? ,annee= ?,statut =?,message=?,admin=?,dateA=?", [type,plateforme,url,annee,error,message,admin,date] );
      }
    }
    catch (e){
      console.log('insert log error'+e)
    }
  }
//returner les total traité dans chaque table
  static async donneesResultat(annee,plateforme,rapport){
    //let rapport=['j1','j2','j4']
    let table
    //for(let val of rapport){
      table='tbl_results_'+rapport
    if(plateforme!=''){
      plateforme=' and PlatformID='+plateforme
    }

    return db.execute("SELECT * FROM "+table+"  WHERE annee=?  " +plateforme+ " order by Title ",[annee])

  }
};
