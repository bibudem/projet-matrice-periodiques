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
  displayedColumns = ['IDRevue','titre', 'ISSN','EISSN','statut','abonnement','bdd','fonds','fournisseur','plateformePrincipale','autrePlateforme','format','libreAcces','domaine','secteur','sujets','duplication','duplicationCourant','duplicationEmbargo1','duplicationEmbargo2','essentiel2014','essentiel2022'];
  // last id Processus
  lastIdProcessus$: Observable<any[]> | undefined;

  lastIdProccessus =0;

  // @ts-ignore
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: paginationPersonnalise | any;

  @ViewChild(MatSort)  matSort : MatSort | any;

  methodesGlobal: MethodesGlobal = new MethodesGlobal();

  records: UpdatePeriodiquesLot[] = [];

  separator = ';';

  admin = '';

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


  async getDataRecordsArrayFromCSVFile(csvRecordsArray: any, headersRow: any, separator:string) {
    // last idProcessus
    this.lastIdProcessus$ = await this.csvService.lastIdProcessus();
    await this.lastIdProcessus$.toPromise().then(res => {
      console.log(res[0].max)
      if(res[0].max!=null)
        this.lastIdProccessus=res[0].max;
    });
    let csvArr: UpdatePeriodiquesLot[] = [];
    // @ts-ignore
    let csvRecord: UpdatePeriodiquesLot = []; let curruntRecord;
    let colIDRevue=-1,colTitre=-1,colISSN=-1
        ,colEISSN=-1,colStatut=-1,colAbonnement=-1,colBdd=-1,colFonds=-1,colFournisseur=-1,colPlateformePrincipale=-1,colAutrePlateforme=-1
        ,colFormat=-1,colLibreAcces=-1,colDomaine=-1,colSecteur=-1,colSujets=-1,colDuplication=-1,colDuplicationCourant=-1,colDuplicationEmbargo1=-1
        ,colDuplicationEmbargo2=-1,colEssentiel2014=-1,colEssentiel2022=-1;
    //prendre le numero des colons selon le nom d'entete
    for(let i=0;i<headersRow.length;i++){
      switch (headersRow[i].trim()){
        case 'IDRevue':
          colIDRevue=i
          break;
        case 'titre':
          colTitre=i
          break;
        case 'ISSN':
          colISSN=i
          break;
        case 'EISSN':
          colEISSN=i
          break;
        case 'statut':
          colStatut=i
          break;
        case 'abonnement':
          colAbonnement=i
          break;
        case 'bdd':
          colBdd=i
          break;
        case 'fonds':
          colFonds=i
          break;
        case 'fournisseur':
          colFournisseur=i
          break;
        case 'plateformePrincipale':
          colPlateformePrincipale=i
          break;
        case 'autrePlateforme':
          colAutrePlateforme=i
          break;
        case 'format':
          colFormat=i
          break;
        case 'libreAcces':
          colLibreAcces=i
          break;
        case 'domaine':
          colDomaine=i
          break;
        case 'secteur':
          colSecteur=i
          break;
        case 'sujets':
          colSujets=i
          break;
        case 'duplication':
          colDuplication=i
          break;
        case 'duplicationCourant':
          colDuplicationCourant=i
          break;
        case 'duplicationEmbargo1':
          colDuplicationEmbargo1=i
          break;
        case 'duplicationEmbargo2':
          colDuplicationEmbargo2=i
          break;
        case 'essentiel2014':
          colEssentiel2014=i
          break;
        case 'essentiel2022':
          colEssentiel2022=i
          break;
      }
    }

    for (let i = 1; i < csvRecordsArray.length; i++) {
        curruntRecord = (<string>csvRecordsArray[i]).split(separator);

          csvRecord = {
            idRevue: this.methodesGlobal.returnCharIfNull(curruntRecord[colIDRevue]),
            titre: this.methodesGlobal.returnCharIfNull(curruntRecord[colTitre]),
            ISSN: this.methodesGlobal.returnCharIfNull(curruntRecord[colISSN]),
            EISSN: this.methodesGlobal.returnCharIfNull(curruntRecord[colEISSN]),
            statut: this.methodesGlobal.returnCharIfNull(curruntRecord[colStatut]),
            abonnement: this.methodesGlobal.returnCharIfNull(curruntRecord[colAbonnement]),
            bdd: this.methodesGlobal.returnCharIfNull(curruntRecord[colBdd]),
            fonds: this.methodesGlobal.returnCharIfNull(curruntRecord[colFonds]),
            fournisseur: this.methodesGlobal.returnCharIfNull(curruntRecord[colFournisseur]),
            plateformePrincipale:this.methodesGlobal.returnCharIfNull(curruntRecord[colPlateformePrincipale]),
            autrePlateforme:this.methodesGlobal.returnCharIfNull(curruntRecord[colAutrePlateforme]),
            format:this.methodesGlobal.returnCharIfNull(curruntRecord[colFormat]),
            libreAcces:this.methodesGlobal.returnCharIfNull(curruntRecord[colLibreAcces]),
            domaine:this.methodesGlobal.returnCharIfNull(curruntRecord[colDomaine]),
            secteur:this.methodesGlobal.returnCharIfNull(curruntRecord[colSecteur]),
            sujets:this.methodesGlobal.returnCharIfNull(curruntRecord[colSujets]),
            duplication:this.methodesGlobal.returnCharIfNull(curruntRecord[colDuplication]),
            duplicationCourant:this.methodesGlobal.returnCharIfNull(curruntRecord[colDuplicationCourant]),
            duplicationEmbargo1:this.methodesGlobal.returnCharIfNull(curruntRecord[colDuplicationEmbargo1]),
            duplicationEmbargo2:this.methodesGlobal.returnCharIfNull(curruntRecord[colDuplicationEmbargo2]),
            essentiel2014:this.methodesGlobal.returnCharIfNull(curruntRecord[colEssentiel2014]),
            essentiel2022:this.methodesGlobal.returnCharIfNull(curruntRecord[colEssentiel2022])
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
  async postArray(records:any){
    //console.log(records)
    this.methodesGlobal.nonAfficher('contenu-form')
    this.methodesGlobal.nonAfficher('contenu-resultat')
    this.methodesGlobal.afficher('load-import')
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
          postLigne.duplication=val.duplication;
          postLigne.duplicationCourant=val.duplicationCourant;
          postLigne.duplicationEmbargo1=val.duplicationEmbargo1;
          postLigne.duplicationEmbargo2=val.duplicationEmbargo2;
          postLigne.essentiel2014=val.essentiel2014;
          postLigne.essentiel2022=val.essentiel2022;
          postLigne.lastIdProcc=this.lastIdProccessus;
          this.post(postLigne);

          await this.methodesGlobal.delay(3000);

          if(i==records.length){
            await this.methodesGlobal.delay(5000);
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
    this.processus = {'titre':'Mise à jour de la liste de périodiques','type':'periodiques','admin':this.admin,'dateStart':dateStart}
    this.addProcessus$ = this.csvService
      .addProcessus(this.processus)
      .pipe(tap(() => (this.router.navigate(['/processus/add']))));
  }

  //cacher l'animation pour la mise a jour des données
  finImportation(){
    this.methodesGlobal.nonAfficher('load-import')
    this.methodesGlobal.afficher('updateStatistiques')
  }


}
