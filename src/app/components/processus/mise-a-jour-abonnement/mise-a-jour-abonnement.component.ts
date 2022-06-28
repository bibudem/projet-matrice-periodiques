import {Component, OnInit, ViewChild} from '@angular/core';
import {Observable} from "rxjs";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {paginationPersonnalise} from "../../../lib/paginationPersonnalise";
import {MatSort} from "@angular/material/sort";
import {MethodesGlobal} from "../../../lib/MethodesGlobal";
import {UpdateAbonnement} from "../../../models/UpdateAbonnement";
import {Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {ProcessusService} from "../../../services/processus.service";
import {tap} from "rxjs/operators";

@Component({
  selector: 'app-mise-a-jour-abonnement',
  templateUrl: './mise-a-jour-abonnement.component.html',
  styleUrls: ['./mise-a-jour-abonnement.component.css']
})
export class MiseAJourAbonnementComponent implements OnInit {

  //Initialiser le tableau d'annee'
  arrayAnnee:any[]=[];
  title = 'Angular7-readCSV';

  annee = '';

  inUpdateAbonnement$: Observable<any[]> | undefined;

  addProcessus$: Observable<any[]> | undefined;
  //importer les fonctions global

  //reponse pour la mise a jour des données
  reponsesUpdate$: Observable<any[]> | undefined;

  reponseUpdate = 0

  //les entêts du tableau
  displayedColumns = ['IDRevue', 'abonnement','bdd','note'];
  tableauPeriodique: any = [];

  // @ts-ignore
  dataSource: MatTableDataSource<InCites>;
  @ViewChild(MatPaginator) paginator: paginationPersonnalise | any;

  @ViewChild(MatSort)  matSort : MatSort | any;

  methodesGlobal: MethodesGlobal = new MethodesGlobal();

  records: UpdateAbonnement[] = [];

  separator = ';';

  admin = '';

  processus:any = {};

  dateStart:string='';

  @ViewChild('InCites') InCites: any;
  csvReader: any;

  constructor(private router: Router,
              private translate: TranslateService,
              private csvService: ProcessusService) { }

  ngOnInit(): void {
    //remplire la liste des annees
    this.anneeOptions()
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
    let csvArr: UpdateAbonnement[] = [];
    // @ts-ignore
    let csvRecord: UpdateAbonnement = []; let curruntRecord;
    let colIDRevue=-1,colAbonnement=-1,colBDD=-1,colNote=-1;
    //prendre le numero des colons selon le nom d'entete
    for(let i=0;i<headersRow.length;i++){
      switch (headersRow[i].trim()){
        case 'IDRevue':
          colIDRevue=i
          break;
        case 'abonnement':
          colAbonnement=i
          break;
        case 'bdd':
          colBDD=i
          break;
        case 'note':
          colNote=i
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
          abonnement: curruntRecord[colAbonnement],
          bdd: curruntRecord[colBDD],
          note:curruntRecord[colNote]
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
  async postArray(records:UpdateAbonnement[]){
    //console.log(records)
    this.methodesGlobal.nonAfficher('contenu-form')
    this.methodesGlobal.nonAfficher('contenu-resultat')
    this.methodesGlobal.afficher('load-import')
    let that=this
    let n: any;
    if (records.length == 0) return;
    let i =0;
    this.dateStart=this.methodesGlobal.dateCreator();
    for (let val of records) {
      n = setTimeout(async function () {
        i++;

        if(val.idRevue!=''){
          await that.post(val.idRevue,val.abonnement,val.bdd,val.note)
        }
        // si la lecture du fichier csv est fini
        if(i==records.length){
          //console.log('add processus component')
          await that.addProcessus('Succès');
        }
      }, 5000);

    }
  }
  //fonction pour inserer
  async post( newIDRevue:string,newAbonnement: string,newBDD: string, newNote: string) {
    if (!newIDRevue) return;

    this.inUpdateAbonnement$ = await this.csvService
      .updateAbonnement({
        newIDRevue,
        newAbonnement,
        newBDD,
        newNote
      })
      .pipe(tap(() => (this.finImportation())));
  }

  async addProcessus(statut:string){
    // creer la date du début

    if(sessionStorage.getItem('prenomAdmin')){
      // @ts-ignore
      this.admin = sessionStorage.getItem('prenomAdmin')+' '+sessionStorage.getItem('nomAdmin');
    }
    this.processus = {'titre':'Mise à jour des abonnements/BDD','statut':statut,'admin':this.admin,'dateStart':this.dateStart}
    this.addProcessus$ = await this.csvService
      .addProcessus(this.processus)
      .pipe(tap(() => (this.router.navigate(['/processus/add']))));
  }

  //cacher l'animation pour la mise a jour des données
  finImportation(){
    this.methodesGlobal.nonAfficher('load-import')
  }



}
