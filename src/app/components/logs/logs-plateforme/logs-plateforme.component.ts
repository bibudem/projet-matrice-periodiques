import {Component, OnInit, ViewChild} from '@angular/core';
import {Observable} from "rxjs";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {paginationPersonnalise} from "../../../lib/paginationPersonnalise";
import {MethodesGlobal} from "../../../lib/MethodesGlobal";
import {LogsListeServiceService} from "../../../services/logs-liste.service";
import {tap} from "rxjs/operators";
import {TranslateService} from "@ngx-translate/core";
import {MatSort} from "@angular/material/sort";
import * as XLSX from "xlsx";

@Component({
  selector: 'app-logs-plateforme',
  templateUrl: './logs-plateforme.component.html',
  styleUrls: ['./logs-plateforme.component.css']
})
export class LogsPlateformeComponent implements OnInit {

  logs$: Observable<any[]> | undefined;

  codes:any=[]

  //les entêts du tableau
  displayedColumns = ['numero', 'plateforme','url','annee','message','dateA','supprimer'];
  listeLogs: any = [];
  // @ts-ignore
  dataSource: MatTableDataSource<listePlateformes>;

  /*name of the excel-file which will be downloaded. */
  fileName= 'rapport-logs-plateformes.xlsx';

  @ViewChild(MatPaginator) paginator: paginationPersonnalise | any;

  @ViewChild(MatSort)  matSort : MatSort | any;

  //importer les fonctions global
  methodesGlobal: MethodesGlobal = new MethodesGlobal()
  constructor(private logsService: LogsListeServiceService,
              private translate:TranslateService) { }

  //appliquer filtre
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    // @ts-ignore
    this.dataSource.filter = filterValue;
  }

  ngOnInit(): void {
    this.getAllLogsPlateforme()

    this.translate.get('codes').subscribe((res: any) => {
      let result = Object.entries(res);
     // console.log(typeof(result))
     for(let [key,val] of result){

       this.codes.push(val)
     }
    });
  }

  async getAllLogsPlateforme() {
    try {
      this.listeLogs=[]
      this.logs$ = this.logsService.getAllLogsPlateforme();
      // @ts-ignore
      await this.logs$.toPromise().then(res => {
        for (let i = 0; i < res.length; i++) {
          this.listeLogs[i]={
            "numero":i+1,
            "idLog":res[i].idLog,
            "plateforme":res[i].plateforme,
            "url":res[i].url,
            "annee":res[i].annee,
            "message":res[i].message,
            "dateA":res[i].dateA,
          }
        }
        // Redéfinir le contenu de la table avec la pagination est la recherche une fois que le resultat de la bd est returné
        this.dataSource = new MatTableDataSource(this.listeLogs);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.matSort;
        //console.log(this.dataSource);
      });
    } catch(err) {
      console.error(`Error : ${err.Message}`);
    }
  }

  async deleteLogsPLateforme(id:string){
    let idP=Number(id)
    this.logs$ = this.logsService
      .deleteLogsPLateforme(idP)
      .pipe(tap(() => (this.getAllLogsPlateforme())));
  }

  //remplire la section pour afficher l'url
  afficherUrlSection(plateforme:string,url:string){
    // @ts-ignore
    document.getElementById('urlLog').innerHTML=plateforme+' => '+url
    this.methodesGlobal.afficher('alert-urlLog')
  }

  //Ajouter la valeur pour l'input
  addValue(val:string){
    let idLog=document.getElementById('idLog')
    if(idLog)
       { // @ts-ignore
         idLog.value=val
       }
  }

  //exporter les données en format xlsx
  async ExportTOExcel()
  {
    let that=this

    setTimeout(async function () {
      let dateNow=new Date().getUTCDate();
      /* table id is passed over here */
      let element = document.getElementById('table-logs-plateformes');
      const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);

      /* generate workbook and add the worksheet */
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Rapport-statistique-'+dateNow);

      /* save to file */
      XLSX.writeFile(wb, that.fileName);
    }, 3000);

    //console.log(this.dataSource);

  }
}
