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
  displayedColumns = ['IDRevue','ISSN','EISSN','annee', 'Total_Item_Requests','No_License','citations','articlesUdem','JR4COURANT','JR4INTER','JR4RETRO','JR3OAGOLD','PlateformeID'];

  // @ts-ignore
  dataSource: MatTableDataSource<InCites>;
  @ViewChild(MatPaginator) paginator: paginationPersonnalise | any;

  @ViewChild(MatSort)  matSort : MatSort | any;

  methodesGlobal: MethodesGlobal = new MethodesGlobal();

  records: UpdateStatistiques[] = [];

  separator = ';';

  admin = '';

  note = '';

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
    while(i <=(anneeNow-2018)){
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
            "PlatformID":res[i].PlatformID,
            "titrePlateforme":res[i].titrePlateforme
          }
        }
      });
    } catch(err: any) {
      console.error(`Error : ${err.message}`);
    }
  }

  uploadListener($event: any): void {
    let text = [];

    let files = $event.srcElement.files;
    if (this.isValidCSVFile(files[0])) {
      let input = $event.target;
      let reader = new FileReader();
      reader.readAsArrayBuffer(input.files[0]);
      reader.onload = async () => {
        const buffer = reader.result as ArrayBuffer;
        const bytes = new Uint8Array(buffer);
        const hasUtf8Bom = bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF;
        const encoding = hasUtf8Bom ? 'utf-8' : 'windows-1252';
        const csvData = new TextDecoder(encoding).decode(buffer);

        let csvRecordsArray = csvData.split(/\r\n|\n/);

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

  async getDataRecordsArrayFromCSVFile(csvRecordsArray: any, headersRow: any, separator: string) {
    let csvArr: UpdateStatistiques[] = [];
    let csvRecord: UpdateStatistiques;
    let currentRecord: string[];
    let colIDRevue = -1, colISSN = -1, colEISSN = -1, colTotal_Item_Requests = -1,
      colNo_License = -1, colCitations = -1, colArticlesUdem = -1, colJR4COURANT = -1,
      colJR4INTER = -1, colJR4RETRO = -1, colJR3OAGOLD = -1, colPlateformeID = -1;

    // Prendre le numéro des colonnes selon le nom d'en-tête
    for (let i = 0; i < headersRow.length; i++) {
      switch (headersRow[i].trim()) {
        case 'IDRevue':
          colIDRevue = i;
          break;
        case 'ISSN':
          colISSN = i;
          break;
        case 'EISSN':
          colEISSN = i;
          break;
        case 'Total_Item_Requests':
          colTotal_Item_Requests = i;
          break;
        case 'No_License':
          colNo_License = i;
          break;
        case 'citations':
          colCitations = i;
          break;
        case 'articlesUdem':
          colArticlesUdem = i;
          break;
        case 'JR4COURANT':
          colJR4COURANT = i;
          break;
        case 'JR4INTER':
          colJR4INTER = i;
          break;
        case 'JR4RETRO':
          colJR4RETRO = i;
          break;
        case 'JR3OAGOLD':
          colJR3OAGOLD = i;
          break;
        case 'PlateformeID':
          colPlateformeID = i;
          break;
      }
    }

    for (let i = 1; i < csvRecordsArray.length; i++) {
      // Ignorer les lignes vides ou non valides
      if (!csvRecordsArray[i] || csvRecordsArray[i].trim() === '') continue;

      if (document.getElementById('annee')) {
        // @ts-ignore
        this.annee = (document.getElementById('annee') as HTMLInputElement).value;
      }

      currentRecord = (csvRecordsArray[i] as string).split(separator);

      const plateformeElement = document.getElementById('plateforme') as HTMLInputElement | null;
      if (plateformeElement) {
        this.plateforme = plateformeElement.value;
      } else {
        this.plateforme = this.methodesGlobal.returnCharIfNull(currentRecord[colPlateformeID]);
      }

      // Assurez-vous que toutes les colonnes nécessaires sont présentes dans la ligne actuelle
      if (currentRecord.length > Math.max(colIDRevue, colISSN, colEISSN, colTotal_Item_Requests, colNo_License, colCitations, colArticlesUdem, colJR4COURANT, colJR4INTER, colJR4RETRO, colJR3OAGOLD, colPlateformeID)) {
        csvRecord = {
          idRevue: this.methodesGlobal.returnCharIfNull(currentRecord[colIDRevue]),
          ISSN: this.methodesGlobal.returnCharIfNull(currentRecord[colISSN]),
          EISSN: this.methodesGlobal.returnCharIfNull(currentRecord[colEISSN]),
          // @ts-ignore
          annee: this.annee,
          Total_Item_Requests: this.methodesGlobal.returnCharIfNull(currentRecord[colTotal_Item_Requests]),
          No_License: this.methodesGlobal.returnCharIfNull(currentRecord[colNo_License]),
          citations: this.methodesGlobal.returnCharIfNull(currentRecord[colCitations]),
          articlesUdem: this.methodesGlobal.returnCharIfNull(currentRecord[colArticlesUdem]),
          JR4COURANT: this.methodesGlobal.returnCharIfNull(currentRecord[colJR4COURANT]),
          JR4INTER: this.methodesGlobal.returnCharIfNull(currentRecord[colJR4INTER]),
          JR4RETRO: this.methodesGlobal.returnCharIfNull(currentRecord[colJR4RETRO]),
          JR3OAGOLD: this.methodesGlobal.returnCharIfNull(currentRecord[colJR3OAGOLD]),
          PlateformeID: this.plateforme
        };
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
  async postArray(records: any[]): Promise<void> {
    if (records.length === 0) return;
    this.processousEnCours();
    this.dateStart = this.methodesGlobal.dateCreator();
    const payload = records.map(val => ({
      idRevue: val.idRevue, ISSN: val.ISSN, EISSN: val.EISSN, annee: val.annee,
      Total_Item_Requests: val.Total_Item_Requests, No_License: val.No_License,
      citations: val.citations, articlesUdem: val.articlesUdem,
      JR4COURANT: val.JR4COURANT, JR4INTER: val.JR4INTER,
      JR4RETRO: val.JR4RETRO, JR3OAGOLD: val.JR3OAGOLD, PlateformeID: val.PlateformeID
    }));
    try {
      await this.csvService.bulkUpdateStatistiques(payload).toPromise();
    } catch (err: any) {
      console.error(`Erreur importation: ${err.message}`);
    }
    await this.addProcessus(this.dateStart);
  }
  //fonction pour inserer
  async post(postLigne: any): Promise<void> {
    try {
      await this.csvService.updateStatistiques(postLigne).toPromise();
    } catch (err: any) {
      console.error(`Erreur ligne ${postLigne.idRevue}: ${err.message}`);
    }
  }
  async addProcessus(dateStart:string): Promise<void> {
    // creer la date du début

    if(sessionStorage.getItem('prenomAdmin')){
      // @ts-ignore
      this.admin = sessionStorage.getItem('prenomAdmin')+' '+sessionStorage.getItem('nomAdmin');
    }
    // @ts-ignore
    if(document.getElementById('note').value!=''){
      // @ts-ignore
      this.note=document.getElementById('note').value.toString();
    }
    this.processus = {'titre':'Mise à jour des statistiques','type':'statistiques','annee':this.annee,'admin':this.admin,'note':this.note,'dateStart':dateStart}
    await this.csvService.addProcessus(this.processus).toPromise();
    this.finImportation();
  }

//cacher l'animation pour la mise a jour des données
  finImportation(){
    this.methodesGlobal.nonAfficher('load-import');
    document.getElementsByTagName("body")[0].style.setProperty('pointer-events','auto');
    this.router.navigate(['/processus/add']);


  }
  processousEnCours(){
    this.methodesGlobal.nonAfficher('contenu-form');
    this.methodesGlobal.nonAfficher('contenu-resultat');
    this.methodesGlobal.afficher('load-import');
    //desactiver les actions durant le processous
    document.getElementsByTagName("body")[0].style.setProperty('pointer-events','none');
  }


}
