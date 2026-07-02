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

  separator=',';

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
    if (this.isValidCSVFile(files[0])) {
      let input = $event.target;
      let reader = new FileReader();
      reader.readAsText(input.files[0]);
      reader.onload = async () => {
        const csvData = reader.result as string;
        let csvRecordsArray = csvData.split(/\r\n|\n/);
        let headersRow = this.getHeaderArray(csvRecordsArray);
        this.records = await this.getDataRecordsArrayFromCSVFile(csvRecordsArray, headersRow);
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


  async getDataRecordsArrayFromCSVFile(csvRecordsArray: any, headersRow: any) {
    let csvArr: InCites[] = [];
    // @ts-ignore
    let csvRecord: InCites = []; let curruntRecord;
    let j = 1;
    let colName=-1,colArUdem=-1,colCitation=-1,colISSN=-1,colEISSN=-1
    //prendre le numero des colons selon le nom d'entete
    if(headersRow.indexOf(';')!=-1){
      this.separator=';';
    }
    for(let i=0;i<headersRow.length;i++){
      switch (headersRow[i].trim()){
        case 'Name':
            colName=i
          break;
        case 'Web of Science Documents':
            colArUdem=i
          break;
        case 'Times Cited':
            colCitation=i
          break;
        case 'ISSN':
            colISSN=i
          break;
        case 'eISSN':
        case 'EISSN':
            colEISSN=i
          break;
        default:
          break;
      }
    }
    for (let i = 1; i < csvRecordsArray.length; i++) {
      let annee='';
        // @ts-ignore
        annee = document.getElementById('annee').value;
        if(csvRecordsArray[i].toString().indexOf(';')!=-1){
          this.separator=';';
        }
       curruntRecord = (<string>csvRecordsArray[i]).split(this.separator);
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

  isValidCSVFile(file: any) {
    return file.name.endsWith(".csv");
  }

  getHeaderArray(csvRecordsArr: any) {
    if(csvRecordsArr[0].toString().indexOf(';')!=-1){
      this.separator=';';
    }
    let headers = (<string>csvRecordsArr[0]).split(this.separator);
    let headerArray = [];
    for (let j = 0; j < headers.length; j++) {
      headerArray.push(headers[j]);
    }
    return headerArray;
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
