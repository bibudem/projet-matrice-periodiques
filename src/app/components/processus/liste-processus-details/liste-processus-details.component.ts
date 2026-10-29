import {Component, OnInit, AfterViewInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {MatDialog} from "@angular/material/dialog";
import {MethodesGlobal} from "../../../lib/MethodesGlobal";
import {ProcessusService} from "../../../services/processus.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ConfirmDialogComponent} from "../../../lib/confirm-suppression-dialog.component";
import * as XLSX from "xlsx";

@Component({
  selector: 'app-liste-processus-details',
  templateUrl: './liste-processus-details.component.html',
  styleUrls: ['./liste-processus-details.component.css']
})
export class ListeProcessusDelailsComponent implements OnInit, AfterViewInit {

  displayedColumns = ['numero', 'idRevue', 'ISSN', 'EISSN', 'titre', 'dateA', 'actions'];
  listeProcessus: any[] = [];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);

  @ViewChild(MatSort) matSort: MatSort | any;

  methodesGlobal: MethodesGlobal = new MethodesGlobal();

  fileName = 'liste-processus.xlsx';
  idProcessus: string = '';
  isLoading = true;
  isExporting = false;

  currentPage = 0;
  pageSize = 25;
  totalItems = 0;
  pageSizeOptions = [25, 50, 100, 200];
  textRechercher = '';

  constructor(
    private processusService: ProcessusService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.idProcessus = this.route.snapshot.paramMap.get('id') as string;
    this.loadDetails();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.matSort;
  }

  private prepareSearch(value: string): string {
    const diacritics = new RegExp('[\\u0300-\\u036f]', 'g');
    return value.normalize('NFD').replace(diacritics, '').toLowerCase().trim();
  }

  applyFilter(filterValue: string): void {
    this.textRechercher = filterValue.trim();
    this.currentPage = 0;
    this.loadDetails(this.prepareSearch(this.textRechercher));
  }

  loadDetails(searchTerm = ''): void {
    this.isLoading = true;
    const skip = this.currentPage * this.pageSize;

    this.processusService.fetchAllDetailsPaginated(this.idProcessus, skip, this.pageSize, searchTerm)
      .subscribe({
        next: (response) => {
          const rows: any[] = response?.data || [];
          this.listeProcessus = rows.map((r: any, i: number) => this.mapRow(r, skip + i + 1));
          this.dataSource.data = this.listeProcessus;
          this.totalItems = response?.total || 0;
          this.isLoading = false;
        },
        error: (err) => {
          console.error(`Erreur chargement détails: ${err}`);
          this.isLoading = false;
        }
      });
  }

  private mapRow(r: any, numero: number): any {
    return {
      numero,
      id_details: r.id_details,
      idRevue: r.idRevue === '-1' ? '!!!' : r.idRevue,
      ISSN: r.ISSN === '-1' ? '!!!' : r.ISSN,
      EISSN: r.EISSN,
      titre: r.titre,
      dateA: r.dateA
    };
  }

  // Exporte toutes les lignes du processus (filtre de recherche inclus), pas seulement la page affichée
  exporterExcel(): void {
    if (this.isExporting || this.totalItems === 0) return;
    this.isExporting = true;

    this.processusService.fetchAllDetailsPaginated(this.idProcessus, 0, this.totalItems, this.prepareSearch(this.textRechercher))
      .subscribe({
        next: (response) => {
          const rows: any[] = (response?.data || []).map((r: any, i: number) => this.mapRow(r, i + 1));
          const donnees = rows.map(r => ({
            'No': r.numero,
            'idRevue': r.idRevue,
            'ISSN': r.ISSN,
            'EISSN': r.EISSN,
            'Titre': r.idRevue === '!!!' ? "Le match n'est pas fait pour ce périodique" : r.titre,
            "Date d'ajout": r.dateA
          }));
          const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(donnees);
          const wb: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'processus-' + this.idProcessus);
          XLSX.writeFile(wb, 'liste-processus-details.xlsx');
          this.isExporting = false;
        },
        error: (err) => {
          console.error(`Erreur export détails: ${err}`);
          this.isExporting = false;
        }
      });
  }

  nextPage(): void {
    if (!this.isLastPage()) { this.currentPage++; this.loadDetails(this.prepareSearch(this.textRechercher)); }
  }

  previousPage(): void {
    if (this.currentPage > 0) { this.currentPage--; this.loadDetails(this.prepareSearch(this.textRechercher)); }
  }

  goToPage(pageNumber: number): void {
    const maxPage = Math.ceil(this.totalItems / this.pageSize) - 1;
    if (pageNumber >= 0 && pageNumber <= maxPage) {
      this.currentPage = pageNumber;
      this.loadDetails(this.prepareSearch(this.textRechercher));
    }
  }

  firstPage(): void { this.currentPage = 0; this.loadDetails(this.prepareSearch(this.textRechercher)); }
  lastPage(): void { this.currentPage = Math.ceil(this.totalItems / this.pageSize) - 1; this.loadDetails(this.prepareSearch(this.textRechercher)); }
  changePageSize(newSize: number): void { this.pageSize = newSize; this.currentPage = 0; this.loadDetails(this.prepareSearch(this.textRechercher)); }
  isFirstPage(): boolean { return this.currentPage === 0; }
  isLastPage(): boolean { return this.currentPage >= Math.ceil(this.totalItems / this.pageSize) - 1; }
  getCurrentPageNumber(): number { return this.currentPage + 1; }
  getTotalPages(): number { return Math.ceil(this.totalItems / this.pageSize); }
  getDisplayStart(): number { return this.totalItems === 0 ? 0 : this.currentPage * this.pageSize + 1; }
  getDisplayEnd(): number { return Math.min((this.currentPage + 1) * this.pageSize, this.totalItems); }

  getPageNumbers(): (number | null)[] {
    const total = this.getTotalPages();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const current = this.getCurrentPageNumber();
    const pages: (number | null)[] = [1];
    if (current > 3) pages.push(null);
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push(null);
    pages.push(total);
    return pages;
  }

  confirmerSuppression(id: string, titre: string): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        titre: 'Confirmation de suppression',
        message: `Êtes-vous sûr de vouloir supprimer la ligne "${titre}" ?`,
        confirmLabel: 'Supprimer',
        confirmColor: 'warn'
      }
    });
    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) this.deleteProcessusDetails(id);
    });
  }

  deleteProcessusDetails(id: string): void {
    this.processusService.deleteDetails(Number(id)).subscribe({
      next: () => this.loadDetails(this.prepareSearch(this.textRechercher)),
      error: (err) => console.error(`Erreur suppression: ${err}`)
    });
  }
}
