import {Component, OnInit, ViewChild} from '@angular/core';
import {Observable} from "rxjs";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {paginationPersonnalise} from "../../../lib/paginationPersonnalise";
import {MatSort} from "@angular/material/sort";
import {MethodesGlobal} from "../../../lib/MethodesGlobal";
import {Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {tap} from "rxjs/operators";
import {ProcessusService} from "../../../services/processus.service";
import {UpdatePeriodiquesLot} from "../../../models/UpdatePeriodiquesLot";
import {ListeChoixOptions} from "../../../lib/ListeChoixOptions";

@Component({
  selector: 'app-importation-en-lot-periodiques',
  templateUrl: './importation-en-lot-periodiques.component.html',
  styleUrls: ['./importation-en-lot-periodiques.component.css']
})
export class MiseEnLotPeriodiquesComponent implements OnInit {

  //Initialiser le tableau d'annee'
  arrayAnnee:any[]=[];
  title = 'Importation des periodiques';

  inUpdatePeriodiques$: Observable<any[]> | undefined;

  addProcessus$: Observable<any[]> | undefined;
  //importer les fonctions global

  reponseUpdate = 0

  //les entêts du tableau
  displayedColumns = ['IDRevue','titre', 'ISSN','EISSN','statut','accesCourant','abonnement','bdd','fonds','fournisseur','plateformePrincipale','autrePlateforme','format','libreAcces','domaine','secteur','sujets','entente_consortiale','duplication','duplicationCourant','duplicationEmbargo1','duplicationEmbargo2','essentiel2014','essentiel2022'];


  // @ts-ignore
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: paginationPersonnalise | any;

  @ViewChild(MatSort)  matSort : MatSort | any;

  methodesGlobal: MethodesGlobal = new MethodesGlobal();

  records: UpdatePeriodiquesLot[] = [];

  separator = ';';

  admin = '';

  note = '';

  processus:any = {};

  dateStart:string='';

  @ViewChild('InCites') InCites: any;
  csvReader: any;

  //importer les liste des choix
  listeChoixOptions: ListeChoixOptions = new ListeChoixOptions();

  constructor(private router: Router,
              private translate: TranslateService,
              private csvService: ProcessusService) { }

  ngOnInit(): void { }

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


  async getDataRecordsArrayFromCSVFile(csvRecordsArray: any, headersRow: any, separator: string) {
    let csvArr: UpdatePeriodiquesLot[] = [];
    let colIndexMap = this.getColumnIndexMap(headersRow);

    for (let i = 1; i < csvRecordsArray.length; i++) {
      let curruntRecord = csvRecordsArray[i].split(separator);
      let csvRecord = this.mapRecord(curruntRecord, colIndexMap);
      csvArr.push(csvRecord);
    }

    return csvArr;
  }

  getColumnIndexMap(headersRow: string[]) {
    let colIndexMap: { [key: string]: number } = {};
    for (let i = 0; i < headersRow.length; i++) {
      colIndexMap[headersRow[i].trim()] = i;
    }
    return colIndexMap;
  }

  mapRecord(curruntRecord: string[], colIndexMap: { [key: string]: number }) {
    return {
      idRevue: this.methodesGlobal.returnCharIfNull(curruntRecord[colIndexMap['IDRevue']]),
      titre: this.methodesGlobal.returnCharIfNull(curruntRecord[colIndexMap['titre']]),
      ISSN: this.methodesGlobal.returnCharIfNull(curruntRecord[colIndexMap['ISSN']]),
      EISSN: this.methodesGlobal.returnCharIfNull(curruntRecord[colIndexMap['EISSN']]),
      statut: this.methodesGlobal.returnCharIfNull(curruntRecord[colIndexMap['statut']]),
      accesCourant: this.methodesGlobal.returnCharIfNull(curruntRecord[colIndexMap['accesCourant']]),
      abonnement: this.methodesGlobal.returnCharIfNull(curruntRecord[colIndexMap['abonnement']]),
      bdd: this.methodesGlobal.returnCharIfNull(curruntRecord[colIndexMap['bdd']]),
      fonds: this.methodesGlobal.returnCharIfNull(curruntRecord[colIndexMap['fonds']]),
      fournisseur: this.methodesGlobal.returnCharIfNull(curruntRecord[colIndexMap['fournisseur']]),
      plateformePrincipale: this.methodesGlobal.returnCharIfNull(curruntRecord[colIndexMap['plateformePrincipale']]),
      autrePlateforme: this.methodesGlobal.returnCharIfNull(curruntRecord[colIndexMap['autrePlateforme']]),
      format: this.methodesGlobal.returnCharIfNull(curruntRecord[colIndexMap['format']]),
      libreAcces: this.methodesGlobal.returnCharIfNull(curruntRecord[colIndexMap['libreAcces']]),
      domaine: this.methodesGlobal.returnCharIfNull(curruntRecord[colIndexMap['domaine']]),
      secteur: this.methodesGlobal.returnCharIfNull(curruntRecord[colIndexMap['secteur']]),
      sujets: this.methodesGlobal.returnCharIfNull(curruntRecord[colIndexMap['sujets']]),
      entente_consortiale: this.methodesGlobal.returnCharIfNull(curruntRecord[colIndexMap['entente_consortiale']]),
      duplication: this.methodesGlobal.returnCharIfNull(curruntRecord[colIndexMap['duplication']]),
      duplicationCourant: this.methodesGlobal.returnCharIfNull(curruntRecord[colIndexMap['duplicationCourant']]),
      duplicationEmbargo1: this.methodesGlobal.returnCharIfNull(curruntRecord[colIndexMap['duplicationEmbargo1']]),
      duplicationEmbargo2: this.methodesGlobal.returnCharIfNull(curruntRecord[colIndexMap['duplicationEmbargo2']]),
      essentiel2014: this.methodesGlobal.returnCharIfNull(curruntRecord[colIndexMap['essentiel2014']]),
      essentiel2022: this.methodesGlobal.returnCharIfNull(curruntRecord[colIndexMap['essentiel2022']])
    };
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
    this.processousEnCours();
    if (records.length == 0) return;
    let i =0;
    this.dateStart=this.methodesGlobal.dateCreator();
    let postLigne : any = {}
    for (let val of records) {
        i++;
          postLigne.idRevue=val.idRevue;
          postLigne.titre=val.titre;
          postLigne.ISSN=val.ISSN;
          postLigne.EISSN=val.EISSN;
          postLigne.statut=val.statut;
          postLigne.accesCourant=val.accesCourant;
          postLigne.abonnement=val.abonnement;
          postLigne.bdd=val.bdd;
          postLigne.fonds=val.fonds;
          postLigne.fournisseur=val.fournisseur;
          postLigne.plateformePrincipale=val.plateformePrincipale;
          postLigne.autrePlateforme=val.autrePlateforme;
          postLigne.format=val.format;
          postLigne.libreAcces=val.libreAcces;
          postLigne.domaine=val.domaine;
          postLigne.secteur=val.secteur;
          postLigne.sujets=val.sujets;
          postLigne.entente_consortiale=val.entente_consortiale;
          postLigne.duplication=val.duplication;
          postLigne.duplicationCourant=val.duplicationCourant;
          postLigne.duplicationEmbargo1=val.duplicationEmbargo1;
          postLigne.duplicationEmbargo2=val.duplicationEmbargo2;
          postLigne.essentiel2014=val.essentiel2014;
          postLigne.essentiel2022=val.essentiel2022;
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
  post( postLigne : any) {
    this.inUpdatePeriodiques$ = this.csvService
      .updateLotPeriodiques(postLigne)
      //.toPromise(tap(() => (this.finImportation())));
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
    this.processus = {'titre':'Mise à jour de la liste de périodiques','type':'periodiques','admin':this.admin,'note':this.note,'dateStart':dateStart}
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
