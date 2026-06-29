import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Observable } from "rxjs";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { paginationPersonnalise } from "../../../lib/paginationPersonnalise";
import { MatSort } from "@angular/material/sort";
import { MatDialog } from '@angular/material/dialog';
import { MethodesGlobal } from "../../../lib/MethodesGlobal";
import { ProcessusService } from "../../../services/processus.service";
import { TranslateService } from "@ngx-translate/core";
import { Router } from "@angular/router";
import { ConfirmDialogComponent } from '../../../lib/confirm-suppression-dialog.component';

@Component({
  selector: 'app-liste-processus',
  templateUrl: './liste-processus.component.html',
  styleUrls: ['./liste-processus.component.css']
})
export class ListeProcessusComponent implements OnInit {
  trackByProcessusId = (index: number, item: any) => item.id_processus;

  processus$: Observable<any[]> | undefined;
  isLoading = true;

  displayedColumns = ['id_processus','titre','annee','plateforme','admin','h_debut','h_fin','statut','note','details','supprimer'];
  listeProcessus: any[] = [];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);

  selectedProcessus: string | undefined;

  @ViewChild(MatPaginator) paginator: paginationPersonnalise | any;
  @ViewChild(MatSort) matSort: MatSort | any;
  @ViewChild('closebutton') closebutton: any;

  methodesGlobal: MethodesGlobal = new MethodesGlobal();
  routerChek: string = '';

  constructor(
    private processusService: ProcessusService,
    private translate: TranslateService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getAllProcessus();
    this.routerChek = this.router.url.toString();
  }

  applyFilter(filterValue: string) {
    // Normalisation pour ignorer accents
    const normalizedFilter = this.methodesGlobal.normalizeString(filterValue.trim().toLowerCase());
    this.dataSource.filter = normalizedFilter;

    // Retour à la première page
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }

    // Filtre personnalisé
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const dataStr = this.methodesGlobal.normalizeString(
        Object.keys(data)
          .filter(key => key !== 'details' && key !== 'supprimer')
          .reduce((currentTerm: string, key: string) => currentTerm + (data[key] ?? '') + '◬', '')
      ).toLowerCase();
      return dataStr.indexOf(filter) !== -1;
    };
  }

  async getAllProcessus() {
    this.isLoading = true;
    this.listeProcessus = [];
    this.dataSource.data = [];

    this.processus$ = this.processusService.fetchAll();

    this.processus$.subscribe({
      next: (res: any[]) => {
        // Injection progressive
        const premiers = res.slice(0, 30).map(item => this.mapProcessus(item));
        //console.log(res);
        this.listeProcessus = [...premiers];
        this.dataSource.data = this.listeProcessus;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.matSort;

        this.isLoading = false;
        this.cdr.detectChanges();

        const reste = res.slice(30).map(item => this.mapProcessus(item));
        let index = 0;
        const chunkSize = 20;
        const interval = setInterval(() => {
          const ajout = reste.slice(index, index + chunkSize);
          if (ajout.length === 0) {
            clearInterval(interval);
            return;
          }
          this.listeProcessus = [...this.listeProcessus, ...ajout];
          this.dataSource.data = this.listeProcessus;
          index += chunkSize;
          this.cdr.detectChanges();
        }, 200);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des processus:', err);
        this.isLoading = false;
      }
    });
  }

  mapProcessus(item: any) {
    return {
      id_processus: item.id_processus,
      titre: item.titre,
      annee: item.annee,
      plateforme: item.plateforme,
      admin: item.admin,
      h_debut: item.h_debut,
      h_fin: item.h_fin,
      statut: item.statut,
      note: item.note
    };
  }

  confirmerSuppression(id: string, titre: string): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        titre: 'Confirmation de suppression',
        message: `Êtes-vous sûr de vouloir supprimer le processus "${titre}" ?`,
        confirmLabel: 'Supprimer',
        confirmColor: 'warn'
      }
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.deleteProcessus(id);
      }
    });
  }

  async deleteProcessus(id: string) {
    try {
      await this.processusService.delete(Number(id)).toPromise();
      this.getAllProcessus();
    } catch(err) {
      console.error('Erreur lors de la suppression:', err);
    }
  }

  linkCreerProcessus(routeLink: string): void {
    this.closebutton.nativeElement.click();
    this.router.navigateByUrl(routeLink);
  }

  detailsProcessous(id: string) {
    this.router.navigate(['/processus/details/' + id]);
  }

  addContenuNote(note: string) {
    const noteElement = document.getElementById("note-contenu");
    if (noteElement) noteElement.innerHTML = note.toString();
  }
}
