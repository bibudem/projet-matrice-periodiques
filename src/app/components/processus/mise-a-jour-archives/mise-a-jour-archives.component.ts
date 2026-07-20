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
    let files = $event.srcElement.files;
    if (this.methodesGlobal.isValidExcelFile(files[0])) {
      (async () => {
        const rows = await this.methodesGlobal.readExcelRows(files[0]);
        let headersRow = rows[0];

        // @ts-ignore
        this.records = await this.getDataRecordsArrayFromFile(rows, headersRow)
        this.dataSource = new MatTableDataSource( this.records);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.matSort;
        this.methodesGlobal.afficher('contenu-resultat')
        this.methodesGlobal.afficher('addCsv')
      })();
    } else {
      alert("Please import valid .xlsx file.");
      this.fileReset();
    }
  }


  async getDataRecordsArrayFromFile(rows: any, headersRow: any) {
    let csvArr: UpdateArchives[] = [];
    // @ts-ignore
    let csvRecord: Archive = []; let curruntRecord;
    let colIDRevue=-1,colPerennite=-1,colConserverPap=-1,colISSN=-1,colEISSN=-1,colAnneeDebut=-1,colAnneeFin=-1,colVolDebut=-1,colVolFin=-1,colEmbargo=-1,colFournisseur=-1;
    //prendre le numero des colons selon le nom d'entete
    for(let i=0;i<headersRow.length;i++){
      switch (this.methodesGlobal.normalizeHeader(headersRow[i])){
        case 'idrevue':
          colIDRevue=i
          break;
        case 'issn':
          colISSN=i
          break;
        case 'eissn':
          colEISSN=i
          break;
        case 'perennite':
          colPerennite=i
          break;
        case 'conserverpap':
          colConserverPap=i
          break;
        case 'anneedebut':
          colAnneeDebut=i
          break;
        case 'anneefin':
          colAnneeFin=i
          break;
        case 'voldebut':
          colVolDebut=i
          break;
        case 'volfin':
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

    for (let i = 1; i < rows.length; i++) {
      if(document.getElementById('annee'))
        // @ts-ignore
        this.annee=document.getElementById('annee').value;

        curruntRecord = rows[i];
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

  fileReset() {
    this.csvReader.nativeElement.value = "";
    this.records = [];
  }


  //inserer les données
  async postArray(records: UpdateArchives[]): Promise<void> {
    if (records.length === 0) return;
    this.processousEnCours();
    this.dateStart = this.methodesGlobal.dateCreator();
    const payload = records.map(val => ({
      idRevue: val.idRevue, ISSN: val.ISSN, EISSN: val.EISSN,
      perennite: val.perennite, conserverPap: val.conserverPap,
      anneeDebut: val.anneeDebut, anneeFin: val.anneeFin,
      volDebut: val.volDebut, volFin: val.volFin,
      embargo: val.embargo, fournisseur: val.fournisseur
    }));
    try {
      await this.csvService.bulkUpdateArchives(payload).toPromise();
    } catch (err: any) {
      console.error(`Erreur importation: ${err.message}`);
    }
    await this.addProcessus(this.dateStart);
  }
  //fonction pour inserer
  async post(postLigne: any): Promise<void> {
    try {
      await this.csvService.updateArchives(postLigne).toPromise();
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
    this.processus = {'titre':'Mise à jour des archives','type':'archives','annee':this.annee,'admin':this.admin,'note':this.note,'dateStart':dateStart}
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
