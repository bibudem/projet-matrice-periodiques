import {Component, OnInit, ViewChild} from '@angular/core';
import {Observable} from "rxjs";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {paginationPersonnalise} from "../../../lib/paginationPersonnalise";
import {MatSort} from "@angular/material/sort";
import {MethodesGlobal} from "../../../lib/MethodesGlobal";
import { UpdateStatistiques } from '../../../models/UpdateStatistiques';
import {Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {tap} from "rxjs/operators";
import {ProcessusService} from "../../../services/processus.service";
import {OutilsService} from "../../../services/outils.service";


@Component({
  selector: 'app-mise-a-jour-statistiques',
  templateUrl: './mise-a-jour-statistiques.component.html',
  styleUrls: ['./mise-a-jour-statistiques.component.css']
})
export class MiseAJourStatistiquesComponent implements OnInit {

  //Initialiser le tableau d'annee'
  arrayAnnee:any[]=[];
  title = 'Importation des statistiques';

  annee = '';
  plateforme= '';

  inUpdateStatistiques$: Observable<any[]> | undefined;

  addProcessus$: Observable<any[]> | undefined;
  //importer les fonctions global

  //reponse pour la mise a jour des données
  reponsesUpdate$: Observable<any[]> | undefined;

  //creer la liste des plateforme
  plateformes$: Observable<any> | undefined;
  listePlateforme: any = [];

  reponseUpdate = 0

  //les entêts du tableau
  displayedColumns = ['IDRevue','annee', 'Total_Item_Requests','Unique_Item_Requests','No_License','citations','articlesUdem','JR5COURANT','JR5INTER','JR5RETRO','JR3OAGOLD','PlateformeID'];
  tableauPeriodique: any = [];

  // @ts-ignore
  dataSource: MatTableDataSource<InCites>;
  @ViewChild(MatPaginator) paginator: paginationPersonnalise | any;

  @ViewChild(MatSort)  matSort : MatSort | any;

  methodesGlobal: MethodesGlobal = new MethodesGlobal();

  records: UpdateStatistiques[] = [];

  separator = ';';

  admin = '';

  processus:any = {};

  dateStart:string='';

  @ViewChild('InCites') InCites: any;
  csvReader: any;

  constructor(private router: Router,
              private translate: TranslateService,
              private csvService: ProcessusService,
              private plateformeService: OutilsService) { }

  ngOnInit(): void {
    //remplire la liste des annees
    this.anneeOptions()
    //remplire la liste des plateforme
    this.creerTableauPlateforme();
  }
  //creation du select d'année a partir de 2019
  anneeOptions(){
    let anneeNow=new Date().getFullYear();
    let i=0
    while(i <=(anneeNow-2019)){
      this.arrayAnnee[i]=anneeNow-i
      i++
    }
  }

  async creerTableauPlateforme() {
    try {
      this.plateformes$ = this.plateformeService.fetchAll();
      // @ts-ignore
      await this.plateformes$.toPromise().then(res => {
        for (let i = 0; i < res.length; i++) {
          this.listePlateforme[i]={
            "numero":i+1,
            "idPlateforme":res[i].idPlateforme,
            "titrePlateforme":res[i].titrePlateforme
          }
        }
      });
    } catch(err) {
      console.error(`Error : ${err.Message}`);
    }
  }

  uploadListener($event: any): void {
    let text = [];
    // @ts-ignore
    this.plateforme=document.getElementById('plateforme').value;
    console.log(this.plateforme)
    //valider le champ plateforme
    if(!this.methodesGlobal.isValueChamp(this.plateforme,'plateforme')){
      // @ts-ignore
      document.getElementById('csvFile').value=''
      return;
    }

    let files = $event.srcElement.files;
    if (this.isValidCSVFile(files[0])) {
      let input = $event.target;
      let reader = new FileReader();
      reader.readAsText(input.files[0]);
      reader.onload = async () => {
        let csvData = await reader.result;

        let csvRecordsArray = (<string>csvData).split(/\r\n|\n/);

        if(csvRecordsArray[0].search(',')!=-1){
          this.separator =','
        }
        //console.log(csvRecordsArray[0].search(';'));
        let headersRow = this.getHeaderArray(csvRecordsArray, this.separator);

        // @ts-ignore
        this.records = await this.getDataRecordsArrayFromCSVFile(csvRecordsArray, headersRow, this.separator)
        this.dataSource = new MatTableDataSource( this.records);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.matSort;
        this.methodesGlobal.afficher('contenu-resultat')
        this.methodesGlobal.afficher('addCsv')
      };

      reader.onerror = function () {
        console.log('error is occured while reading file!');
      };
    } else {
      alert("Please import valid .csv file.");
      this.fileReset();
    }
  }


  async getDataRecordsArrayFromCSVFile(csvRecordsArray: any, headersRow: any, separator:string) {
    let csvArr: UpdateStatistiques[] = [];
    // @ts-ignore
    let csvRecord: UpdateStatistiques = []; let curruntRecord;
    let colIDRevue=-1,colTotal_Item_Requests=-1,colUnique_Item_Requests=-1
        ,colNo_License=-1,colCitations=-1,colArticlesUdem=-1,colJR5COURANT=-1,colJR5INTER=-1,colJR5RETRO=-1,colJR3OAGOLD=-1,colPlateformeID=-1;
    //prendre le numero des colons selon le nom d'entete
    for(let i=0;i<headersRow.length;i++){
      switch (headersRow[i].trim()){
        case 'IDRevue':
          colIDRevue=i
          break;
        case 'Total_Item_Requests':
          colTotal_Item_Requests=i
          break;
        case 'Unique_Item_Requests':
          colUnique_Item_Requests=i
          break;
        case 'No_License':
          colNo_License=i
          break;
        case 'citations':
          colCitations=i
          break;
        case 'articlesUdem':
          colArticlesUdem=i
          break;
        case 'JR5COURANT':
          colJR5COURANT=i
          break;
        case 'JR5INTER':
          colJR5INTER=i
          break;
        case 'JR5RETRO':
          colJR5RETRO=i
          break;
        case 'JR3OAGOLD':
          colJR3OAGOLD=i
          break;
        case 'PlateformeID':
          colPlateformeID=i
          break;
      }
    }

    for (let i = 1; i < csvRecordsArray.length; i++) {
      if(document.getElementById('annee'))
        // @ts-ignore
        this.annee=document.getElementById('annee').value;

        curruntRecord = (<string>csvRecordsArray[i]).split(separator);
        if(curruntRecord[colIDRevue]!='') {

          csvRecord = {
            idRevue: curruntRecord[colIDRevue],
            // @ts-ignore
            annee: this.annee,
            Total_Item_Requests: this.methodesGlobal.returnCharIfNull(curruntRecord[colTotal_Item_Requests]),
            Unique_Item_Requests: this.methodesGlobal.returnCharIfNull(curruntRecord[colUnique_Item_Requests]),
            No_License: this.methodesGlobal.returnCharIfNull(curruntRecord[colNo_License]),
            citations: this.methodesGlobal.returnCharIfNull(curruntRecord[colCitations]),
            articlesUdem: this.methodesGlobal.returnCharIfNull(curruntRecord[colArticlesUdem]),
            JR5COURANT: this.methodesGlobal.returnCharIfNull(curruntRecord[colJR5COURANT]),
            JR5INTER: this.methodesGlobal.returnCharIfNull(curruntRecord[colJR5INTER]),
            JR5RETRO: this.methodesGlobal.returnCharIfNull(curruntRecord[colJR5RETRO]),
            JR3OAGOLD:this.methodesGlobal.returnCharIfNull(curruntRecord[colJR3OAGOLD]),
            PlateformeID:this.plateforme
          }
          csvArr.push(csvRecord);
        }
    }
     //console.log(csvArr)
    return csvArr;
  }

  isValidCSVFile(file: any) {
    return file.name.endsWith(".csv");
  }

  getHeaderArray(csvRecordsArr: any, separator:string) {
    let headers = (<string>csvRecordsArr[0]).split(separator);
    let headerArray = [];
    for (let j = 0; j < headers.length; j++) {
      headerArray.push(headers[j]);
    }
    return headerArray;
  }

  fileReset() {
    this.csvReader.nativeElement.value = "";
    this.records = [];
  }


  //inserer les données
  async postArray(records:any){
    //console.log(records)
    this.methodesGlobal.nonAfficher('contenu-form')
    this.methodesGlobal.nonAfficher('contenu-resultat')
    this.methodesGlobal.afficher('load-import')
    let that=this
    let n: any;
    if (records.length == 0) return;
    let i =0;
    this.dateStart=this.methodesGlobal.dateCreator();
    let postLigne : any = {}
    for (let val of records) {
      n = setTimeout(async function () {
        i++;

        if(val.PlateformeID=='-'){
          alert('Opération interrompue, certaines règles ont été mal respecté');
          return
        }
          postLigne.idRevue=val.idRevue;
          postLigne.annee=val.annee;
          postLigne.Total_Item_Requests=val.Total_Item_Requests;
          postLigne.Unique_Item_Requests=val.Unique_Item_Requests;
          postLigne.No_License=val.No_License;
          postLigne.citations=val.citations;
          postLigne.articlesUdem=val.articlesUdem;
          postLigne.JR5COURANT=val.JR5COURANT;
          postLigne.JR5INTER=val.JR5INTER;
          postLigne.JR5RETRO=val.JR5RETRO;
          postLigne.JR3OAGOLD=val.JR3OAGOLD;
          postLigne.PlateformeID=val.PlateformeID;
          await that.post(postLigne)

        // si la lecture du fichier csv est fini
        if(i==records.length){
          //console.log('add processus component')
          await that.addProcessus('Succès');
        }
      }, 5000);

    }
  }
  //fonction pour inserer
  async post( postLigne : any) {

    this.inUpdateStatistiques$ = await this.csvService
      .updateStatistiques(postLigne)
      //.toPromise(tap(() => (this.finImportation())));
  }

  async addProcessus(statut:string){
    // creer la date du début

    if(sessionStorage.getItem('prenomAdmin')){
      // @ts-ignore
      this.admin = sessionStorage.getItem('prenomAdmin')+' '+sessionStorage.getItem('nomAdmin');
    }
    this.processus = {'titre':'Mise à jour des statistiques','statut':statut,'admin':this.admin,'dateStart':this.dateStart}
    this.addProcessus$ = await this.csvService
      .addProcessus(this.processus)
      .pipe(tap(() => (this.router.navigate(['/processus/add']))));
  }

  //cacher l'animation pour la mise a jour des données
  finImportation(){
    this.methodesGlobal.nonAfficher('load-import')
    this.methodesGlobal.afficher('updateStatistiques')
  }


}
