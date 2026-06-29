import {Component, OnInit, ViewChild} from '@angular/core';
import {Observable} from "rxjs";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {paginationPersonnalise} from "../../../../lib/paginationPersonnalise";
import {MethodesGlobal} from "../../../../lib/MethodesGlobal";
import {TranslateService} from "@ngx-translate/core";
import {OutilsService} from "../../../../services/outils.service";
import {Plateforme} from "../../../../models/Plateforme";
import {MatSort} from "@angular/material/sort";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmDialogComponent} from "../../../../lib/confirm-suppression-dialog.component";

@Component({
  selector: 'app-liste-plateformes',
  templateUrl: './liste-plateformes.component.html',
  styleUrls: ['./liste-plateformes.component.css']
})
export class ListePlateformesComponent implements OnInit {
  plateformes$: Observable<any[]> | undefined;

  // @ts-ignore
  public plateforme: Plateforme = {};
  id: string | null | undefined;
  displayedColumns = ['numero', 'PlatformID', 'titrePlateforme', 'dateM', 'actions'];
  listePlateforme: any = [];
  // @ts-ignore
  dataSource: MatTableDataSource<listePlateformes>;
  @ViewChild(MatPaginator) paginator: paginationPersonnalise | any;
  @ViewChild(MatSort) matSort: MatSort | any;

  methodesGlobal: MethodesGlobal = new MethodesGlobal();
  bouttonAction = '';
  ifAdmin = false;

  constructor(
    private periodiquePlateformeService: OutilsService,
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
    this.creerTableau();
  }

  async creerTableau() {
    try {
      this.translate.get('btn-ajouter-plateforme').subscribe((res: string) => {
        this.bouttonAction = res;
      });
      this.plateformes$ = await this.fetchAll();
      await this.plateformes$.toPromise().then(res => {
        for (let i = 0; i < res.length; i++) {
          this.listePlateforme[i] = {
            "numero": i + 1,
            "idPlateforme": res[i].idPlateforme,
            "PlatformID": res[i].PlatformID,
            "titrePlateforme": res[i].titrePlateforme,
            "dateM": res[i].dateM
          };
        }
        this.dataSource = new MatTableDataSource(this.listePlateforme);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.matSort;
      });
    } catch (err: any) {
      console.error(`Error : ${err.message}`);
    }
  }

  confirmerSuppression(id: number, titre: string) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        titre: 'Supprimer la plateforme',
        message: `Êtes-vous sûr de vouloir supprimer la plateforme « ${titre} » ? Cette action est irréversible.`,
        confirmLabel: 'Supprimer',
        confirmColor: 'warn'
      }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.periodiquePlateformeService.delete(id).subscribe({
        next: () => {
          this.listePlateforme = this.listePlateforme.filter((p: any) => p.idPlateforme !== id);
          this.dataSource = new MatTableDataSource(this.listePlateforme);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.matSort;
        },
        error: (err: any) => console.error('Erreur suppression plateforme', err)
      });
    });
  }

  consulter(id: number) {
    localStorage.setItem('idPlateforme', id.toString());
    localStorage.setItem('action', 'save');
  }

  fetchAll(): Observable<Plateforme[]> {
    return this.periodiquePlateformeService.fetchAll();
  }

  addPlateform() {
    localStorage.setItem('action', 'add-plateforme');
    localStorage.setItem('idPlateforme', '');
  }
}
