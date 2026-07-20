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
    let csvArr: UpdatePeriodiquesLot[] = [];
    let colIndexMap = this.getColumnIndexMap(headersRow);

    for (let i = 1; i < rows.length; i++) {
      let curruntRecord = rows[i];
      let csvRecord = this.mapRecord(curruntRecord, colIndexMap);
      csvArr.push(csvRecord);
    }

    return csvArr;
  }

  getColumnIndexMap(headersRow: string[]) {
    let colIndexMap: { [key: string]: number } = {};
    for (let i = 0; i < headersRow.length; i++) {
      colIndexMap[this.methodesGlobal.normalizeHeader(headersRow[i])] = i;
    }
    return colIndexMap;
  }

  mapRecord(curruntRecord: string[], colIndexMap: { [key: string]: number }) {
    const col = (nom: string) => colIndexMap[this.methodesGlobal.normalizeHeader(nom)];
    return {
      idRevue: this.methodesGlobal.returnCharIfNull(curruntRecord[col('IDRevue')]),
      titre: this.methodesGlobal.returnCharIfNull(curruntRecord[col('titre')]),
      ISSN: this.methodesGlobal.returnCharIfNull(curruntRecord[col('ISSN')]),
      EISSN: this.methodesGlobal.returnCharIfNull(curruntRecord[col('EISSN')]),
      statut: this.methodesGlobal.returnCharIfNull(curruntRecord[col('statut')]),
      accesCourant: this.methodesGlobal.returnCharIfNull(curruntRecord[col('accesCourant')]),
      abonnement: this.methodesGlobal.returnCharIfNull(curruntRecord[col('abonnement')]),
      bdd: this.methodesGlobal.returnCharIfNull(curruntRecord[col('bdd')]),
      fonds: this.methodesGlobal.returnCharIfNull(curruntRecord[col('fonds')]),
      fournisseur: this.methodesGlobal.returnCharIfNull(curruntRecord[col('fournisseur')]),
      plateformePrincipale: this.methodesGlobal.returnCharIfNull(curruntRecord[col('plateformePrincipale')]),
      autrePlateforme: this.methodesGlobal.returnCharIfNull(curruntRecord[col('autrePlateforme')]),
      format: this.methodesGlobal.returnCharIfNull(curruntRecord[col('format')]),
      libreAcces: this.methodesGlobal.returnCharIfNull(curruntRecord[col('libreAcces')]),
      domaine: this.methodesGlobal.returnCharIfNull(curruntRecord[col('domaine')]),
      secteur: this.methodesGlobal.returnCharIfNull(curruntRecord[col('secteur')]),
      sujets: this.methodesGlobal.returnCharIfNull(curruntRecord[col('sujets')]),
      entente_consortiale: this.methodesGlobal.returnCharIfNull(curruntRecord[col('entente_consortiale')]),
      duplication: this.methodesGlobal.returnCharIfNull(curruntRecord[col('duplication')]),
      duplicationCourant: this.methodesGlobal.returnCharIfNull(curruntRecord[col('duplicationCourant')]),
      duplicationEmbargo1: this.methodesGlobal.returnCharIfNull(curruntRecord[col('duplicationEmbargo1')]),
      duplicationEmbargo2: this.methodesGlobal.returnCharIfNull(curruntRecord[col('duplicationEmbargo2')]),
      essentiel2014: this.methodesGlobal.returnCharIfNull(curruntRecord[col('essentiel2014')]),
      essentiel2022: this.methodesGlobal.returnCharIfNull(curruntRecord[col('essentiel2022')])
    };
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
