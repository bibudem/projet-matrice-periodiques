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
import {tap} from "rxjs/operators";
import {MatSort} from "@angular/material/sort";

@Component({
  selector: 'app-importation-csv',
  templateUrl: './importation-csv.component.html',
  styleUrls: ['./importation-csv.component.css']
})
export class ImportationCsvComponent implements OnInit {

  //Initialiser le tableau d'annee'
  arrayAnnee:any[]=[];
  title = 'Angular7-readCSV';

  inCites$: Observable<any[]> | undefined;
  //importer les fonctions global

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
  csvReader: any;

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
    while(i <=(anneeNow-2014)){
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
    let name='',annee,ArticlesUdeM='0',Citations='0',ISSN='',EISSN=''; let j=1;
    let colName=0,colArUdem=-1,colCitation=-1,colISSN=-1,colEISSN=-1
    //prendre le numero des colons selon le nom d'entete
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
            colEISSN=i
          break;
      }
    }
    for (let i = 1; i < csvRecordsArray.length; i++) {
      if(document.getElementById('annee'))
        // @ts-ignore
        annee=document.getElementById('annee').value
      curruntRecord = (<string>csvRecordsArray[i]).split(',');
      //if (curruntRecord[colName]) {
        csvRecord = {
          numero: j,
          // @ts-ignore
          annee: annee,
          Name: curruntRecord[colName],
          ArticlesUdeM: curruntRecord[colArUdem],
          Citations: curruntRecord[colCitation],
          EISSN: curruntRecord[colEISSN],
          ISSN:curruntRecord[colISSN]
        }
        csvArr.push(csvRecord);
        j++
      //}
    }
    // console.log(csvArr)
    return csvArr;
  }

  isValidCSVFile(file: any) {
    return file.name.endsWith(".csv");
  }

  getHeaderArray(csvRecordsArr: any) {
    let headers = (<string>csvRecordsArr[0]).split(',');
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
 async postArray(records:InCites[]){
   //console.log(records)
   this.methodesGlobal.nonAfficher('contenu-form')
   this.methodesGlobal.nonAfficher('contenu-resultat')
   this.methodesGlobal.afficher('load-import')
   let that=this

   let n: any;
    for (let val of records) {
      n = setTimeout(async function () {
        await that.post(0,val.annee,val.Name,val.ArticlesUdeM,val.Citations,val.ISSN,val.EISSN)
      }, 5000);
    }

 }
  //fonction pour inserer
  async post( newNumero:number,newAnnee: string,newName: string,
        newArticlesUdeM: string,newCitations: string,
        newISSN: string,newEISSN: string) {
    if (!newName) return;

    this.inCites$ = await this.csvService
      .post({
        newNumero,
        newAnnee,
        newName,
        newArticlesUdeM,
        newCitations,
        newISSN,
        newEISSN
      })
      .pipe(tap(() => (this.finImportation())));
  }
  //cacher l'animation pour la mise a jour des données
  finImportation(){
    this.methodesGlobal.nonAfficher('load-import')
    this.methodesGlobal.afficher('updateStatistique')
  }

  //mise a jour des statistique
  async updateStatistique(annee:string){
        try {
          this.methodesGlobal.afficher('load-import')
          this.methodesGlobal.nonAfficher('updateStatistique')
          this.reponsesUpdate$ = this.csvService.updateStatistique(annee);
          await this.reponsesUpdate$.toPromise().then(res => {
              if (res){
                this.methodesGlobal.nonAfficher('load-import')
                this.methodesGlobal.afficher('resultUpdate')
                this.reponseUpdate = res[0]
              }
            }
          );
        } catch(err) {
          console.error(`Error : ${err.Message}`);
        }
  }

}
