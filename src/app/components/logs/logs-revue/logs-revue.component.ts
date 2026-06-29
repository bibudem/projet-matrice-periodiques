import {Component, OnInit, ViewChild} from '@angular/core';
import {Observable} from "rxjs";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {paginationPersonnalise} from "../../../lib/paginationPersonnalise";
import {MethodesGlobal} from "../../../lib/MethodesGlobal";
import {LogsListeServiceService} from "../../../services/logs-liste.service";
import {tap} from "rxjs/operators";
import {MatSort} from "@angular/material/sort";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmDialogComponent} from "../../../lib/confirm-suppression-dialog.component";

@Component({
  selector: 'app-logs-revue',
  templateUrl: './logs-revue.component.html',
  styleUrls: ['./logs-revue.component.css']
})
export class LogsRevueComponent implements OnInit {

  logs$: Observable<any[]> | undefined;

  codes: any = [];
  arrayAnnee: any[] = [];
  annee = new Date().getFullYear() - 1;

  displayedColumns = ['numero', 'ISSN', 'EISSN', 'Title', 'rapport', 'annee', 'fournisseur', 'dateA', 'actions'];
  listeLogs: any = [];
  isLoading  = false;
  dataLoaded = false;
  // @ts-ignore
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: paginationPersonnalise | any;
  @ViewChild(MatSort) matSort: MatSort | any;

  methodesGlobal: MethodesGlobal = new MethodesGlobal();
  ifAdmin = false;

  constructor(
    private logsService: LogsListeServiceService,
    private dialog: MatDialog
  ) {}

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim().toLowerCase();
    // @ts-ignore
    this.dataSource.filter = filterValue;
  }

  ngOnInit(): void {
    this.ifAdmin = this.methodesGlobal.ifAdminFunction();
    this.getAllLogsRevue(this.annee.toString());
    this.anneeOptions();
  }

  async getAllLogsRevue(annee: string) {
    try {
      this.isLoading = true;
      this.listeLogs = [];
      this.logs$ = this.logsService.getAllLogsRevue(annee);
      // @ts-ignore
      await this.logs$.toPromise().then(res => {
        for (let i = 0; i < res.length; i++) {
          this.listeLogs[i] = {
            "numero": i + 1,
            "id_log": res[i].id_log,
            "ISSN": res[i].ISSN,
            "EISSN": res[i].EISSN,
            "Title": res[i].Title,
            "rapport": res[i].rapport,
            "annee": res[i].annee,
            "fournisseur": res[i].PlatformID,
            "dateA": res[i].dateA,
          };
        }
        this.dataSource = new MatTableDataSource(this.listeLogs);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.matSort;
      });
    } catch (err: any) {
      console.error(`Error : ${err.message}`);
    } finally {
      this.isLoading  = false;
      this.dataLoaded = true;
    }
  }

  canStepYear(direction: number): boolean {
    return this.arrayAnnee.includes(this.annee + direction);
  }

  stepYear(direction: number): void {
    this.annee += direction;
    this.getAllLogsRevue(this.annee.toString());
  }

  confirmerSuppression(id: number, titre: string): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        titre: 'Supprimer le log',
        message: `Êtes-vous sûr de vouloir supprimer le log « ${titre} » ? Cette action est irréversible.`,
        confirmLabel: 'Supprimer',
        confirmColor: 'warn'
      }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.logs$ = this.logsService
        .deleteLogsRevue(id)
        .pipe(tap(() => this.getAllLogsRevue(this.annee.toString())));
    });
  }

  anneeOptions() {
    let anneeNow = new Date().getFullYear();
    let i = 0;
    while (i <= (anneeNow - 2019)) {
      this.arrayAnnee[i] = anneeNow - i;
      i++;
    }
  }
}
