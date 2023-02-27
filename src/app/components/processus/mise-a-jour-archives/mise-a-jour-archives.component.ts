import {Component, OnInit, ViewChild} from '@angular/core';
import {Observable} from "rxjs";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {paginationPersonnalise} from "../../../lib/paginationPersonnalise";
import {MatSort} from "@angular/material/sort";
import {MethodesGlobal} from "../../../lib/MethodesGlobal";
import {UpdateArchives} from '../../../models/UpdateArchives';
import {Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {tap} from "rxjs/operators";
import {ProcessusService} from "../../../services/processus.service";


@Component({
  selector: 'app-mise-a-jour-archives',
  templateUrl: './mise-a-jour-archives.component.html',
  styleUrls: ['./mise-a-jour-archives.component.css']
})
export class MiseAJourArchivesComponent implements OnInit {

  //Initialiser le tableau d'annee'
  arrayAnnee:any[]=[];
  title = 'Angular7-readCSV';

  annee = '';

  inUpdateArchives$: Observable<any[]> | undefined;

  addProcessus$: Observable<any[]> | undefined;
  //importer les fonctions global

  //reponse pour la mise a jour des données
  reponsesUpdate$: Observable<any[]> | undefined;

  reponseUpdate = 0

  //les entêts du tableau
  displayedColumns = ['IDRevue','ISSN','EISSN','perennite', 'conserverPap','anneeDebut','anneeFin','volDebut','volFin','embargo','fournisseur'];


  // @ts-ignore
  dataSource: MatTableDataSource<InCites>;
  @ViewChild(MatPaginator) paginator: paginationPersonnalise | any;

  @ViewChild(MatSort)  matSort : MatSort | any;

  methodesGlobal: MethodesGlobal = new MethodesGlobal();

  records: UpdateArchives[] = [];

  separator = ';';

  admin = '';

  note='';

  processus:any = {};

  dateStart:string='';

  @ViewChild('InCites') InCites: any;
  csvReader: any;

  constructor(private router: Router,
              private translate: TranslateService,
              private csvService: ProcessusService) { }

  ngOnInit(): void {

  }


  uploadListener($event: any): void {
    let text = [];
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
    let csvArr: UpdateArchives[] = [];
    // @ts-ignore
    let csvRecord: Archive = []; let curruntRecord;
    let colIDRevue=-1,colPerennite=-1,colConserverPap=-1,colISSN=-1,colEISSN=-1,colAnneeDebut=-1,colAnneeFin=-1,colVolDebut=-1,colVolFin=-1,colEmbargo=-1,colFournisseur=-1;
    //prendre le numero des colons selon le nom d'entete
    for(let i=0;i<headersRow.length;i++){
      switch (headersRow[i].trim()){
        case 'IDRevue':
          colIDRevue=i
          break;
        case 'ISSN':
          colISSN=i
          break;
        case 'EISSN':
          colEISSN=i
          break;
        case 'perennite':
          colPerennite=i
          break;
        case 'conserverPap':
          colConserverPap=i
          break;
        case 'anneeDebut':
          colAnneeDebut=i
          break;
        case 'anneeFin':
          colAnneeFin=i
          break;
        case 'volDebut':
          colVolDebut=i
          break;
        case 'volFin':
          colVolFin=i
          break;
        case 'embargo':
          colEmbargo=i
          break;
        case 'fournisseur':
          colFournisseur=i
          break;
      }
    }

    for (let i = 1; i < csvRecordsArray.length; i++) {
      if(document.getElementById('annee'))
        // @ts-ignore
        this.annee=document.getElementById('annee').value;

        curruntRecord = (<string>csvRecordsArray[i]).split(separator);
          csvRecord = {
            idRevue: this.methodesGlobal.returnCharIfNull(curruntRecord[colIDRevue]),
            ISSN: this.methodesGlobal.returnCharIfNull(curruntRecord[colISSN]),
            EISSN: this.methodesGlobal.returnCharIfNull(curruntRecord[colEISSN]),
            perennite: this.methodesGlobal.returnCharIfNull(curruntRecord[colPerennite]),
            conserverPap:this.methodesGlobal.returnCharIfNull(curruntRecord[colConserverPap]),
            anneeDebut:this.methodesGlobal.returnCharIfNull(curruntRecord[colAnneeDebut]),
            anneeFin:this.methodesGlobal.returnCharIfNull(curruntRecord[colAnneeFin]),
            volDebut:this.methodesGlobal.returnCharIfNull(curruntRecord[colVolDebut]),
            volFin:this.methodesGlobal.returnCharIfNull(curruntRecord[colVolFin]),
            embargo:this.methodesGlobal.returnCharIfNull(curruntRecord[colEmbargo]),
            fournisseur:this.methodesGlobal.returnCharIfNull(curruntRecord[colFournisseur])
          }
          csvArr.push(csvRecord);
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
  async postArray(records:UpdateArchives[]){
    //console.log(records)
    this.processousEnCours();
    let that=this
    let n: any;
    if (records.length == 0) return;
    let i =0;
    this.dateStart=this.methodesGlobal.dateCreator();
    let postLigne : any = {}
    for (let val of records) {
          i++;
          postLigne=val
          this.post(postLigne);
          await this.methodesGlobal.delay(100);

          if(i==records.length){
            await this.methodesGlobal.delay(1000);
            //console.log('fin processus');
            this.addProcessus(this.dateStart);

        }


    }
  }
  //fonction pour inserer
  post( postLigne: string) {
    this.inUpdateArchives$ = this.csvService
      .updateArchives(postLigne)
      //.pipe(tap(() => ()));
  }

  addProcessus(dateStart:string){
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
    this.processus = {'titre':'Mise à jour des archives','type':'prix','admin':this.admin,'note':this.note,'dateStart':dateStart}
    this.addProcessus$ = this.csvService
      .addProcessus(this.processus)
      .pipe(tap(() => (this.finImportation())));
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
