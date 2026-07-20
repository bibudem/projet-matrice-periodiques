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

  reponseUpdate = 0

  // last id Processus
  lastIdProcessus$: Observable<any[]> | undefined;

  lastIdProccessus =0;

  //les entêts du tableau
  displayedColumns = ['IDRevue','ISSN','EISSN', 'abonnement','bdd','note'];


  // @ts-ignore
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: paginationPersonnalise | any;

  @ViewChild(MatSort)  matSort : MatSort | any;

  methodesGlobal: MethodesGlobal = new MethodesGlobal();

  records: UpdateAbonnement[] = [];

  admin = '';

  note ='';

  processus:any = {};

  dateStart:string='';

  @ViewChild('InCites') InCites: any;
  csvReader: any;

  constructor(private router: Router,
              private translate: TranslateService,
              private csvService: ProcessusService) { }

  ngOnInit(): void {
    //remplire la liste des annees
    this.anneeOptions();
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
    let csvArr: UpdateAbonnement[] = [];
    // @ts-ignore
    let csvRecord: UpdateAbonnement = []; let curruntRecord;
    let colIDRevue=-1,colAbonnement=-1,colISSN=-1,colEISSN=-1,colBDD=-1,colNote=-1;
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

    for (let i = 1; i < rows.length; i++) {
      if(document.getElementById('annee'))
        // @ts-ignore
        this.annee=document.getElementById('annee').value;

      curruntRecord = rows[i];

        csvRecord = {
          idRevue: this.methodesGlobal.returnCharIfNull(curruntRecord[colIDRevue]),
          // @ts-ignore
          annee: this.annee,
          ISSN: this.methodesGlobal.returnCharIfNull(curruntRecord[colISSN]),
          EISSN: this.methodesGlobal.returnCharIfNull(curruntRecord[colEISSN]),
          abonnement: this.methodesGlobal.returnCharIfNull(curruntRecord[colAbonnement]),
          bdd: this.methodesGlobal.returnCharIfNull(curruntRecord[colBDD]),
          note:this.methodesGlobal.returnCharIfNull(curruntRecord[colNote])
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
  async postArray(records: UpdateAbonnement[]): Promise<void> {
    if (records.length === 0) return;
    this.processousEnCours();
    this.dateStart = this.methodesGlobal.dateCreator();
    const payload = records.map(val => ({
      idRevue: val.idRevue, issn: val.ISSN, eissn: val.EISSN,
      abonnement: val.abonnement, bdd: val.bdd, note: val.note
    }));
    try {
      await this.csvService.bulkUpdateAbonnement(payload).toPromise();
    } catch (err: any) {
      console.error(`Erreur importation: ${err.message}`);
    }
    await this.addProcessus(this.dateStart);
  }
  //fonction pour inserer
  async post(postLigne: any): Promise<void> {
    try {
      await this.csvService.updateAbonnement(postLigne).toPromise();
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
    this.processus = {'titre':'Mise à jour des abonnements/BDD','type':'abonnements','annee':this.annee,'admin':this.admin,'note':this.note,'dateStart':dateStart}
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
