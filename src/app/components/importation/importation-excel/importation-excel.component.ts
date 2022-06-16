import { Component, OnInit, ViewChild } from '@angular/core';
import {Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import { statistiqueExcel } from '../../../models/statistiqueExcel';
import {ImportationCsvService} from "../../../services/importation-csv.service";
import {MethodesGlobal} from "../../../lib/MethodesGlobal";
import {Observable} from "rxjs";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {paginationPersonnalise} from "../../../lib/paginationPersonnalise";
import {tap} from "rxjs/operators";

@Component({
  selector: 'app-importation-excel',
  templateUrl: './importation-excel.component.html',
  styleUrls: ['./importation-excel.component.css']
})
export class ImportationExcelComponent implements OnInit {

  //Initialiser le tableau d'annee'
  arrayAnnee:any[]=[];
  title = 'Angular7-readCSV';

  statistiqueExcel$: Observable<any[]> | undefined;
  //importer les fonctions global

  //reponse pour la mise a jour des données
  reponsesUpdate$: Observable<any[]> | undefined;

  reponseUpdate=0

  //les entêts du tableau
  displayedColumns = ['numero','annee', 'plateforme','titre','ISSN','EISSN','Total_Item_Requests','Unique_Item_Requests','No_License','JR5COURANT','JR5INTER','JR5RETRO'];
  tableauStatistique: any = [];

  // @ts-ignore
  dataSource: MatTableDataSource<statistiqueExcel>;
  @ViewChild(MatPaginator) paginator: paginationPersonnalise | any;

  methodesGlobal: MethodesGlobal = new MethodesGlobal();

  records: statistiqueExcel[] = [];
  @ViewChild('statistiqueExcel') statistiqueExcel: any;
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
    while(i <=(anneeNow-2015)){
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
    let csvArr: statistiqueExcel[] = [];
    // @ts-ignore
    let csvRecord: statistiqueExcel = []; let curruntRecord=[];
    let name='',annee,colTitre=-1,colTotal_Item_Requests=-1,ISSN='',EISSN=''; let j=1;
    let colPlateforme=-1,colUnique_Item_Requests=-1,colNo_License=-1,colISSN=-1,colEISSN=-1,colJR5COURANT=-1,colJR5INTER=-1,colJR5RETRO=-1
    //prendre le numero des colons selon le nom d'entete
    console.log(headersRow)
    for(let i=0;i<headersRow.length;i++){
      switch (headersRow[i].trim()){
        case 'Plateforme':
            colPlateforme=i
          break;
        case 'Titre':
            colTitre=i
          break;
        case 'ISSN':
            colISSN=i
          break;
        case 'EISSN':
            colEISSN=i
          break;
        case 'Telechargements':
          colTotal_Item_Requests=i
          break;
        case 'Tel-uniques':
          colUnique_Item_Requests=i
          break;
        case 'Refus':
          colNo_License=i
          break;
        case 'JR5-COURANT':
          colJR5COURANT=i
          break;
        case 'JR5-COURANT':
          colJR5INTER=i
          break;
        case 'JR5-RETRO':
          colJR5RETRO=i
          break;
        default:
      }
    }
    for (let i = 1; i < csvRecordsArray.length; i++) {
      if(csvRecordsArray[i].length!=0){
        // @ts-ignore
        annee=document.getElementById('annee').value

         curruntRecord = (csvRecordsArray[i]).toString().split(';');

      csvRecord = {
          numero: j,
          // @ts-ignore
          annee: annee,
          plateforme: curruntRecord[colPlateforme],
          titre: curruntRecord[colTitre],
          EISSN: curruntRecord[colEISSN],
          ISSN:curruntRecord[colISSN],
          Total_Item_Requests: curruntRecord[colTotal_Item_Requests],
          Unique_Item_Requests:curruntRecord[colUnique_Item_Requests],
          No_License:curruntRecord[colNo_License],
          JR5COURANT:curruntRecord[colJR5COURANT],
          JR5INTER:curruntRecord[colJR5INTER],
          JR5RETRO:curruntRecord[colJR5RETRO]
        }
        csvArr.push(csvRecord);
        j++
      }
    }
    console.log(csvArr)
    return csvArr;
  }

  isValidCSVFile(file: any) {
    return file.name.endsWith(".csv");
  }

  getHeaderArray(csvRecordsArr: any) {
    let headers = (<string>csvRecordsArr[0]).split(';');
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
 async postArray(records:statistiqueExcel[]){
   //console.log(records)
   this.methodesGlobal.nonAfficher('contenu-form')
   this.methodesGlobal.nonAfficher('contenu-resultat')
   this.methodesGlobal.afficher('load-import')
   let that=this

   let n: any;
    for (let val of records) {
      n = setTimeout(async function () {
        await that.postExcelStatistique(0,val.annee,val.plateforme,val.titre,val.ISSN,val.EISSN,val.Total_Item_Requests,val.Unique_Item_Requests,val.No_License,val.JR5COURANT,val.JR5INTER,val.JR5RETRO)
      }, 5000);
    }

 }
  //fonction pour inserer
  async postExcelStatistique( newNumero:number,newAnnee: string,newPlateforme: string,
        newTitre: string,newISSN: string,newEISSN: string,newTotal_Item_Requests: string,newUnique_Item_Requests: string,newNo_License: string,newJR5COURANT: string,newJR5INTER: string,newJR5RETRO: string) {
    if (!newTitre) return;

    this.statistiqueExcel$ = await this.csvService
      .postExcelStatistique({
        newNumero,
        newAnnee,
        newPlateforme,
        newTitre,
        newISSN,
        newEISSN,
        newTotal_Item_Requests,
        newUnique_Item_Requests,
        newNo_License,
        newJR5COURANT,
        newJR5INTER,
        newJR5RETRO

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
