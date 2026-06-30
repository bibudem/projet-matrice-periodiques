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
  async postArray(records: any[]): Promise<void> {
    if (records.length === 0) return;
    this.processousEnCours();
    this.dateStart = this.methodesGlobal.dateCreator();
    const payload = records.map(val => ({
      idRevue: val.idRevue, titre: val.titre, ISSN: val.ISSN, EISSN: val.EISSN,
      statut: val.statut, accesCourant: val.accesCourant, abonnement: val.abonnement,
      bdd: val.bdd, fonds: val.fonds, fournisseur: val.fournisseur,
      plateformePrincipale: val.plateformePrincipale, autrePlateforme: val.autrePlateforme,
      format: val.format, libreAcces: val.libreAcces, domaine: val.domaine,
      secteur: val.secteur, sujets: val.sujets, entente_consortiale: val.entente_consortiale,
      duplication: val.duplication, duplicationCourant: val.duplicationCourant,
      duplicationEmbargo1: val.duplicationEmbargo1, duplicationEmbargo2: val.duplicationEmbargo2,
      essentiel2014: val.essentiel2014, essentiel2022: val.essentiel2022
    }));
    try {
      await this.csvService.bulkUpdateLotPeriodiques(payload).toPromise();
    } catch (err: any) {
      console.error(`Erreur importation: ${err.message}`);
    }
    await this.addProcessus(this.dateStart);
  }
  //fonction pour inserer
  async post(postLigne: any): Promise<void> {
    try {
      await this.csvService.updateLotPeriodiques(postLigne).toPromise();
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
    this.processus = {'titre':'Versements en lot des fiches des périodiques','type':'periodiques','admin':this.admin,'note':this.note,'dateStart':dateStart}
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
