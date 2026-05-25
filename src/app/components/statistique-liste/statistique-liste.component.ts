import {Component, OnInit, AfterViewInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import type {Sort} from "@angular/material/sort";
import {MethodesGlobal} from "../../lib/MethodesGlobal";
import {ListeStatistiquesService} from "../../services/liste-statistiques.service";
import {ActivatedRoute, Router} from "@angular/router";
import * as XLSX from "xlsx";

@Component({
  selector: 'app-statistique-liste',
  templateUrl: './statistique-liste.component.html',
  styleUrls: ['./statistique-liste.component.css']
})
export class StatistiqueListeComponent implements OnInit, AfterViewInit {
  displayedColumns = ['numero','annee','plateforme','titre','telech','refus','citation','articlesUdem','dateA','dateM','consulter'];
  tableauStatistique: any[] = [];

  @ViewChild(MatSort) matSort: MatSort | any;

  methodesGlobal: MethodesGlobal = new MethodesGlobal();

  annee = new Date().getFullYear();
  anneeStatistique: string = '';
  arrayAnnee: any[] = [];

  isLoading = true;
  ifAdmin = false;

  textRechercher = '';

  // Pagination manuelle
  currentPage = 0;
  pageSize = 25;
  totalItems = 0;
  pageSizeOptions = [25, 50, 75, 100, 150];

  // Tri serveur
  sortColumn = 'titre';
  sortDirection = 'asc';

  // @ts-ignore
  dataSource: MatTableDataSource<any>;

  fileName = 'rapport-statistiques-liste.xlsx';

  constructor(
    private listeStatistiqueService: ListeStatistiquesService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.anneeOptions();
    this.ifAdmin = this.methodesGlobal.ifAdminFunction();

    const anneeFromUrl = this.route.snapshot.paramMap.get("annee");
    this.anneeStatistique = anneeFromUrl ? anneeFromUrl : String(this.annee);

    const savedPage = localStorage.getItem('stat_currentPage');
    const savedSize = localStorage.getItem('stat_pageSize');
    const savedSortCol = localStorage.getItem('stat_sortColumn');
    const savedSortDir = localStorage.getItem('stat_sortDirection');
    const savedFiltre = localStorage.getItem('stat_textFiltre');
    const savedAnnee = localStorage.getItem('stat_annee');

    if (savedPage) this.currentPage = parseInt(savedPage, 10);
    if (savedSize) this.pageSize = parseInt(savedSize, 10);
    if (savedSortCol) this.sortColumn = savedSortCol;
    if (savedSortDir) this.sortDirection = savedSortDir;
    if (savedFiltre) this.textRechercher = savedFiltre;
    if (!anneeFromUrl && savedAnnee) this.anneeStatistique = savedAnnee;
  }

  ngAfterViewInit(): void {
    this.dataSource = new MatTableDataSource<any>([]);

    this.matSort.sortChange.subscribe((sort: Sort) => {
      this.sortColumn = sort.active || 'titre';
      this.sortDirection = sort.direction || 'asc';
      this.currentPage = 0;
      this.loadStatistiques();
    });

    this.loadStatistiques();
  }

  loadStatistiques(): void {
    this.isLoading = true;
    const skip = this.currentPage * this.pageSize;
    const search = this.methodesGlobal.normalizeString(this.textRechercher.toLowerCase());

    localStorage.setItem('stat_currentPage', this.currentPage.toString());
    localStorage.setItem('stat_pageSize', this.pageSize.toString());
    localStorage.setItem('stat_sortColumn', this.sortColumn);
    localStorage.setItem('stat_sortDirection', this.sortDirection);
    localStorage.setItem('stat_annee', this.anneeStatistique);

    this.listeStatistiqueService.fetchAllPaginated(
      this.anneeStatistique, skip, this.pageSize, search, this.sortColumn, this.sortDirection
    ).subscribe({
      next: (response: any) => {
        const rows: any[] = Array.isArray(response?.data) ? response.data : [];
        const offset = this.currentPage * this.pageSize;
        this.tableauStatistique = rows.map((val: any, idx: number) => ({
          numero: offset + idx + 1,
          idRevue: val.idP,
          annee: val.annee,
          idStatistique: val.idStatistique,
          plateforme: val.plateforme,
          titre: val.titreP,
          telech: val.Total_Item_Requests || 0,
          refus: val.No_License || 0,
          citation: val.citations || 0,
          articlesUdem: val.articlesUdem || 0,
          dateA: val.dateA,
          dateM: val.dateM,
        }));
        this.dataSource.data = this.tableauStatistique;
        this.totalItems = response?.total || 0;
        this.isLoading = false;
      },
      error: (err: unknown) => {
        console.error(`Erreur chargement statistiques : ${String(err)}`);
        this.isLoading = false;
      }
    });
  }

  applyFilter(filterValue: string): void {
    localStorage.setItem('stat_textFiltre', filterValue);
    this.textRechercher = filterValue.trim();
    this.currentPage = 0;
    this.loadStatistiques();
  }

  changerAnnee(annee: string): void {
    this.anneeStatistique = annee;
    this.currentPage = 0;
    this.loadStatistiques();
  }

  viderFiltre(): void {
    const input = document.getElementById('textFiltre') as HTMLInputElement;
    if (input) {
      input.value = '';
      localStorage.setItem('stat_textFiltre', '');
      this.textRechercher = '';
      this.currentPage = 0;
      this.loadStatistiques();
    }
  }

  consulterStatistique(id: string, titre: string): void {
    localStorage.setItem('titrePeridique', titre);
    this.router.navigate(['/periodique/statistiques/' + id + '/historique']);
  }

  anneeOptions(): void {
    let anneeNow = new Date().getFullYear();
    for (let i = 0; i <= anneeNow - 2018; i++) {
      this.arrayAnnee[i] = anneeNow - i;
    }
  }

  // ===== PAGINATION MANUELLE =====

  nextPage(): void {
    if (!this.isLastPage()) { this.currentPage++; this.loadStatistiques(); }
  }

  previousPage(): void {
    if (this.currentPage > 0) { this.currentPage--; this.loadStatistiques(); }
  }

  goToPage(pageNumber: number): void {
    const maxPage = Math.ceil(this.totalItems / this.pageSize) - 1;
    if (pageNumber >= 0 && pageNumber <= maxPage) {
      this.currentPage = pageNumber;
      this.loadStatistiques();
    }
  }

  firstPage(): void {
    this.currentPage = 0;
    this.loadStatistiques();
  }

  lastPage(): void {
    this.currentPage = Math.ceil(this.totalItems / this.pageSize) - 1;
    this.loadStatistiques();
  }

  changePageSize(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 0;
    this.loadStatistiques();
  }

  isFirstPage(): boolean { return this.currentPage === 0; }

  isLastPage(): boolean {
    return this.currentPage >= Math.ceil(this.totalItems / this.pageSize) - 1;
  }

  getCurrentPageNumber(): number { return this.currentPage + 1; }

  getTotalPages(): number { return Math.ceil(this.totalItems / this.pageSize); }

  getDisplayStart(): number {
    return this.totalItems === 0 ? 0 : this.currentPage * this.pageSize + 1;
  }

  getDisplayEnd(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalItems);
  }

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

  async ExportTOExcel() {
    const that = this;
    setTimeout(async function () {
      const dateNow = new Date().getUTCDate();
      const element = document.getElementById('table-rapport-statistiques-liste');
      const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Rapport-logs-revues-' + dateNow);
      XLSX.writeFile(wb, that.fileName);
    }, 3000);
  }
}
