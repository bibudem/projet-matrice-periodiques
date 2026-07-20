import { Component, OnInit, ViewChild } from '@angular/core';
import {Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import { InCites } from '../../../models/InCites';
import {ImportationCsvService} from "../../../services/importation-csv.service";
import {MethodesGlobal} from "../../../lib/MethodesGlobal";
import {Observable} from "rxjs";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {paginationPersonnalise} from "../../../lib/paginationPersonnalise";
import {MatSort} from "@angular/material/sort";

@Component({
  selector: 'app-importation-csv',
  templateUrl: './importation-inCites.component.html',
  styleUrls: ['./importation-inCites.component.css']
})
export class ImportationInCitesComponent implements OnInit {

  //Initialiser le tableau d'annee'
  arrayAnnee:any[]=[];
  title = 'Angular7-readCSV';

  //reponse pour la mise a jour des données
  reponsesUpdate$: Observable<any[]> | undefined;

  reponseUpdate=0

  //les entêts du tableau
  displayedColumns = ['numero','annee', 'Name','ArticlesUdeM','Citations','ISSN','EISSN'];
  tableauStatistique: any = [];

  // @ts-ignore
  dataSource: MatTableDataSource<InCites>;
  @ViewChild(MatPaginator) paginator: paginationPersonnalise | any;

  @ViewChild(MatSort)  matSort : MatSort | any;

  methodesGlobal: MethodesGlobal = new MethodesGlobal();

  records: InCites[] = [];
  @ViewChild('InCites') InCites: any;

  //entetes attendues dans le fichier Excel (annee vient du select, pas du fichier)
  headersFichier = ['Name','Web of Science Documents','Times Cited','ISSN','EISSN'];

  constructor( private router: Router,
               private translate: TranslateService,
               private csvService: ImportationCsvService) { }

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
    let files = $event.srcElement.files;
    if (this.methodesGlobal.isValidExcelFile(files[0])) {
      (async () => {
        const rows = await this.methodesGlobal.readExcelRows(files[0]);
        let headersRow = rows[0];
        this.records = await this.getDataRecordsArrayFromFile(rows, headersRow);
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
    let csvArr: InCites[] = [];
    // @ts-ignore
    let csvRecord: InCites = []; let curruntRecord;
    let j = 1;
    let colName=-1,colArUdem=-1,colCitation=-1,colISSN=-1,colEISSN=-1
    //prendre le numero des colons selon le nom d'entete
    for(let i=0;i<headersRow.length;i++){
      switch (this.methodesGlobal.normalizeHeader(headersRow[i])){
        case 'name':
            colName=i
          break;
        case 'webofsciencedocuments':
            colArUdem=i
          break;
        case 'timescited':
            colCitation=i
          break;
        case 'issn':
            colISSN=i
          break;
        case 'eissn':
            colEISSN=i
          break;
        default:
          break;
      }
    }
    for (let i = 1; i < rows.length; i++) {
      let annee='';
        // @ts-ignore
        annee = document.getElementById('annee').value;

       curruntRecord = rows[i];
      //if (curruntRecord[colName]) {
        csvRecord = {
          numero: j,
          // @ts-ignore
          annee: annee,
          Name: this.methodesGlobal.returnCharIfNull(curruntRecord[colName]),
          ArticlesUdeM: this.methodesGlobal.returnCharIfNull(curruntRecord[colArUdem]),
          Citations: this.methodesGlobal.returnCharIfNull(curruntRecord[colCitation]),
          EISSN: this.methodesGlobal.returnCharIfNull(curruntRecord[colEISSN]),
          ISSN:this.methodesGlobal.returnCharIfNull(curruntRecord[colISSN])
        }
        csvArr.push(csvRecord);
        j++
      //}
    }
     //console.log(csvArr)
    return csvArr;
  }

  fileReset() {
    this.InCites.nativeElement.value = "";
    this.records = [];
  }


  async postArray(records: any[]) {
    this.methodesGlobal.nonAfficher('contenu-form');
    this.methodesGlobal.nonAfficher('contenu-resultat');
    this.methodesGlobal.afficher('load-import');
    document.getElementsByTagName("body")[0].style.setProperty('pointer-events', 'none');

    const toSend = records
      .filter(val => val.Name !== '-')
      .map(val => ({
        annee: val.annee,
        Name: val.Name,
        ArticlesUdeM: val.ArticlesUdeM,
        Citations: val.Citations,
        ISSN: val.ISSN,
        EISSN: val.EISSN
      }));

    try {
      await this.csvService.postBulk(toSend).toPromise();
    } catch (err: any) {
      console.error(`Erreur import: ${err.message}`);
    }
    this.finImportation();
  }
  //cacher l'animation pour la mise a jour des données
  finImportation(){
    this.methodesGlobal.nonAfficher('load-import');
    this.methodesGlobal.afficher('updateStatistique');
    document.getElementsByTagName("body")[0].style.setProperty('pointer-events','auto');
  }

  //mise a jour des statistique
  async updateStatistique(annee:string){
        try {
          this.methodesGlobal.afficher('load-import');
          //desactiver les actions durant le processous
          document.getElementsByTagName("body")[0].style.setProperty('pointer-events','none');
          this.methodesGlobal.nonAfficher('updateStatistique');
          this.reponsesUpdate$ = this.csvService.updateStatistique(annee);
          await this.reponsesUpdate$.toPromise().then(res => {
              if (res){
                this.methodesGlobal.nonAfficher('load-import');
                this.methodesGlobal.afficher('resultUpdate');
                this.reponseUpdate = res[0];
                document.getElementsByTagName("body")[0].style.setProperty('pointer-events','auto');
              }
            }
          );
        } catch(err: any) {
          console.error(`Error : ${err.message}`);
        }
  }

}
