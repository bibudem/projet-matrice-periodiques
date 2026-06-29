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
import {MatDialog} from "@angular/material/dialog";
import {ConfirmDialogComponent} from "../../../lib/confirm-suppression-dialog.component";
import * as XLSX from "xlsx";

@Component({
  selector: 'app-logs-plateforme',
  templateUrl: './logs-plateforme.component.html',
  styleUrls: ['./logs-plateforme.component.css']
})
export class LogsPlateformeComponent implements OnInit {

  logs$: Observable<any[]> | undefined;

  codes: any = [];

  displayedColumns = ['numero', 'plateforme', 'url', 'annee', 'message', 'dateA', 'actions'];
  listeLogs: any = [];
  // @ts-ignore
  dataSource: MatTableDataSource<listePlateformes>;

  fileName = 'rapport-logs-plateformes.xlsx';

  @ViewChild(MatPaginator) paginator: paginationPersonnalise | any;
  @ViewChild(MatSort) matSort: MatSort | any;

  methodesGlobal: MethodesGlobal = new MethodesGlobal();
  ifAdmin = false;
  currentUrl: string = '';
  urlCopied = false;

  constructor(
    private logsService: LogsListeServiceService,
    private translate: TranslateService,
    private dialog: MatDialog
  ) {}

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim().toLowerCase();
    // @ts-ignore
    this.dataSource.filter = filterValue;
  }

  ngOnInit(): void {
    this.ifAdmin = this.methodesGlobal.ifAdminFunction();
    this.getAllLogsPlateforme();
    this.translate.get('codes').subscribe((res: any) => {
      let result = Object.entries(res);
      for (let [, val] of result) {
        this.codes.push(val);
      }
    });
  }

  async getAllLogsPlateforme() {
    try {
      this.listeLogs = [];
      this.logs$ = this.logsService.getAllLogsPlateforme();
      // @ts-ignore
      await this.logs$.toPromise().then(res => {
        for (let i = 0; i < res.length; i++) {
          this.listeLogs[i] = {
            "numero": i + 1,
            "idLog": res[i].idLog,
            "plateforme": res[i].plateforme,
            "url": res[i].url,
            "annee": res[i].annee,
            "message": res[i].message,
            "dateA": res[i].dateA,
          };
        }
        this.dataSource = new MatTableDataSource(this.listeLogs);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.matSort;
      });
    } catch (err: any) {
      console.error(`Error : ${err.message}`);
    }
  }

  confirmerSuppression(id: number, plateforme: string): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        titre: 'Supprimer le log',
        message: `Êtes-vous sûr de vouloir supprimer le log de la plateforme « ${plateforme} » ? Cette action est irréversible.`,
        confirmLabel: 'Supprimer',
        confirmColor: 'warn'
      }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.logs$ = this.logsService
        .deleteLogsPLateforme(id)
        .pipe(tap(() => this.getAllLogsPlateforme()));
    });
  }

  copierUrlCourante(): void {
    navigator.clipboard.writeText(this.currentUrl).then(() => {
      this.urlCopied = true;
      setTimeout(() => this.urlCopied = false, 1800);
    }).catch(err => console.error('Erreur copie URL', err));
  }

  afficherUrlSection(plateforme: string, url: string) {
    const elPlateforme = document.getElementById('urlPlateforme');
    const elUrl = document.getElementById('urlLog');
    if (elPlateforme) elPlateforme.textContent = plateforme;
    if (elUrl) elUrl.textContent = url;
    this.currentUrl = url;
    this.urlCopied = false;
    this.methodesGlobal.afficher('alert-urlLog');
  }

  async ExportTOExcel() {
    let that = this;
    setTimeout(async function () {
      let dateNow = new Date().getUTCDate();
      let element = document.getElementById('table-logs-plateformes');
      const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Rapport-statistique-' + dateNow);
      XLSX.writeFile(wb, that.fileName);
    }, 3000);
  }
}
