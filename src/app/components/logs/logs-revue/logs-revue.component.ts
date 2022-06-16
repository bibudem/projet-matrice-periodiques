import {Component, OnInit, ViewChild} from '@angular/core';
import {Observable} from "rxjs";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {paginationPersonnalise} from "../../../lib/paginationPersonnalise";
import {MethodesGlobal} from "../../../lib/MethodesGlobal";
import {LogsListeServiceService} from "../../../services/logs-liste.service";
import {TranslateService} from "@ngx-translate/core";
import {tap} from "rxjs/operators";
import {MatSort} from "@angular/material/sort";
import * as XLSX from "xlsx";

@Component({
  selector: 'app-logs-revue',
  templateUrl: './logs-revue.component.html',
  styleUrls: ['./logs-revue.component.css']
})
export class LogsRevueComponent implements OnInit {

  logs$: Observable<any[]> | undefined;

  codes:any=[]

  //les entêts du tableau
  displayedColumns = ['numero', 'ISSN','EISSN','Title','rapport','annee','fournisseur','dateA','supprimer'];
  listeLogs: any = [];
  // @ts-ignore
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: paginationPersonnalise | any;
  @ViewChild(MatSort)  matSort : MatSort | any;

  //importer les fonctions global
  methodesGlobal: MethodesGlobal = new MethodesGlobal();

  /*name of the excel-file which will be downloaded. */
  fileName= 'rapport-logs-revues.xlsx';

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
    this.getAllLogsRevue()

  }
  async getAllLogsRevue() {
    try {
      this.listeLogs=[]
      this.logs$ = this.logsService.getAllLogsRevue();
      // @ts-ignore
      await this.logs$.toPromise().then(res => {
        for (let i = 0; i < res.length; i++) {
          this.listeLogs[i]={
            "numero":i+1,
            "id_log":res[i].id_log,
            "ISSN":res[i].ISSN,
            "EISSN":res[i].EISSN,
            "Title":res[i].Title,
            "rapport":res[i].rapport,
            "annee":res[i].annee,
            "fournisseur":res[i].PlatformID,
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

  async deleteLogsRevue(id:string){
    let idP=Number(id)
    this.logs$ = this.logsService
      .deleteLogsRevue(idP)
      .pipe(tap(() => (this.getAllLogsRevue())));
  }

  //Ajouter la valeur pour l'input
  addValue(val:string){
    let id_log=document.getElementById('id_log')
    if(id_log)
    { // @ts-ignore
      id_log.value=val
    }
  }

  //exporter les données en format xlsx
  async ExportTOExcel()
  {
    let that=this

    setTimeout(async function () {
      let dateNow=new Date().getUTCDate();
      /* table id is passed over here */
      let element = document.getElementById('table-rapport-logs-revues');
      const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);

      /* generate workbook and add the worksheet */
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Rapport-logs-revues-'+dateNow);

      /* save to file */
      XLSX.writeFile(wb, that.fileName);
    }, 3000);

    //console.log(this.dataSource);

  }
}
