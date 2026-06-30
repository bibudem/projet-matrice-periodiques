import {Component, OnInit} from '@angular/core';
import {MethodesGlobal} from "../../../lib/MethodesGlobal";
import {Observable} from "rxjs";
import {OutilsService} from "../../../services/outils.service";
import {ImportationSushiService} from "../../../services/importation-sushi.service";
import {Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {UpdateStatistiqueService} from "../../../services/update-statistique.service";
import {MatTableDataSource} from "@angular/material/table";
import * as XLSX from "xlsx";


@Component({
  selector: 'app-importation-sushi',
  templateUrl: './importation-sushi.component.html',
  styleUrls: ['./importation-sushi.component.css']
})
export class ImportationSushiComponent implements OnInit {
  listeRaports: any = {};
  id: string | null | undefined;
  listeRaports$: Observable<any[]> | undefined;
  displayedColumns = ['numero', 'PlatformID', 'ISSN', 'EISSN', 'Title', 'annee', 'Metric_Type', 'Reporting_Period_Total', 'dateA'];
  tableauRapports: any = [];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);

  methodesGlobal: MethodesGlobal = new MethodesGlobal();

  plateformes$: Observable<any> | undefined;
  listePlateforme: any = [];

  statistiques$: Observable<any> | undefined;
  donnees$: Observable<any> | undefined;
  listeImport: any = [];

  arrayAnnee: any[] = [];
  totalUpdate = -1;
  isLoading = false;

  currentPage = 0;
  pageSize = 25;
  totalItems = 0;
  pageSizeOptions = [25, 50, 100, 200];
  textRechercher = '';

  currentAnnee = '';
  currentPlateforme = '';
  currentRapport = '';

  constructor(private plateformeService: OutilsService,
              private router: Router,
              private translate: TranslateService,
              private api: ImportationSushiService,
              private updateStatistique: UpdateStatistiqueService) {}

  ngOnInit(): void {
    this.creerTableauPlateforme();
    this.anneeOptions();
  }

  private prepareSearch(value: string): string {
    const diacritics = new RegExp('[\\u0300-\\u036f]', 'g');
    return value.normalize('NFD').replace(diacritics, '').toLowerCase().trim();
  }

  applyFilter(filterValue: string): void {
    this.textRechercher = filterValue.trim();
    this.currentPage = 0;
    this.loadResultats(this.prepareSearch(this.textRechercher));
  }

  async importer(plateforme: string, annee: string) {
    let that = this;
    this.afficherAnimation();
    this.donnees$ = await this.api.fetchAll(annee, plateforme);
    await this.donnees$.toPromise().then(res => {
      if (res) {
        setTimeout(async function () {
          that.nonAfficherAnimation();
        }, 3000);
        this.methodesGlobal.nonAfficher('contenu-resultat');
        this.methodesGlobal.nonAfficher('result-update');
        this.methodesGlobal.afficher('reponse-importation');
        this.methodesGlobal.afficher('contenu-form');
      }
    });
  }

  async creerTableauPlateforme() {
    try {
      this.plateformes$ = this.plateformeService.fetchAll();
      await this.plateformes$.toPromise().then(res => {
        for (let i = 0; i < res.length; i++) {
          this.listePlateforme[i] = {
            "numero": i + 1,
            "PlatformID": res[i].PlatformID,
            "titrePlateforme": res[i].titrePlateforme
          };
        }
      });
    } catch (err: any) {
      console.error(`Error : ${err.Message}`);
    }
  }

  creerTableauResultat(annee: string, plateforme: string, rapport: string): void {
    this.currentAnnee = annee;
    this.currentPlateforme = plateforme || 'vide';
    this.currentRapport = rapport;
    this.currentPage = 0;
    this.textRechercher = '';
    this.methodesGlobal.nonAfficher('reponse-importation');
    this.methodesGlobal.nonAfficher('result-update');
    this.methodesGlobal.nonAfficher('tableauResult');
    this.loadResultats();
  }

  loadResultats(searchTerm = ''): void {
    if (!this.currentRapport) return;
    this.isLoading = true;
    const skip = this.currentPage * this.pageSize;

    this.plateformeService.resultatRapportPaginated(
      this.currentAnnee, this.currentPlateforme, this.currentRapport, skip, this.pageSize, searchTerm
    ).subscribe({
      next: (response) => {
        const rows: any[] = response?.data || [];
        this.tableauRapports = rows.map((r: any, i: number) => ({
          numero: skip + i + 1,
          PlatformID: r.PlatformID,
          ISSN: r.ISSN,
          EISSN: r.EISSN,
          Title: r.Title,
          annee: r.annee,
          Metric_Type: r.Metric_Type,
          Reporting_Period_Total: r.Reporting_Period_Total,
          dateA: r.dateA
        }));
        this.dataSource.data = this.tableauRapports;
        this.totalItems = response?.total || 0;
        this.isLoading = false;
        this.methodesGlobal.afficher('filtreResult');
        this.methodesGlobal.afficher('bouton-actions');
        if (this.totalItems > 0) {
          this.methodesGlobal.afficher('tableauResult');
        } else {
          this.methodesGlobal.nonAfficher('tableauResult');
        }
      },
      error: (err) => {
        console.error(`Erreur chargement résultats: ${err}`);
        this.isLoading = false;
      }
    });
  }

  nextPage(): void {
    if (!this.isLastPage()) { this.currentPage++; this.loadResultats(this.prepareSearch(this.textRechercher)); }
  }

  previousPage(): void {
    if (this.currentPage > 0) { this.currentPage--; this.loadResultats(this.prepareSearch(this.textRechercher)); }
  }

  goToPage(pageNumber: number): void {
    const maxPage = Math.ceil(this.totalItems / this.pageSize) - 1;
    if (pageNumber >= 0 && pageNumber <= maxPage) {
      this.currentPage = pageNumber;
      this.loadResultats(this.prepareSearch(this.textRechercher));
    }
  }

  firstPage(): void { this.currentPage = 0; this.loadResultats(this.prepareSearch(this.textRechercher)); }
  lastPage(): void { this.currentPage = Math.ceil(this.totalItems / this.pageSize) - 1; this.loadResultats(this.prepareSearch(this.textRechercher)); }
  changePageSize(newSize: number): void { this.pageSize = newSize; this.currentPage = 0; this.loadResultats(this.prepareSearch(this.textRechercher)); }
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

  anneeOptions() {
    let anneeNow = new Date().getFullYear();
    let i = 0;
    while (i <= (anneeNow - 2019)) {
      this.arrayAnnee[i] = anneeNow - i;
      i++;
    }
  }

  afficherAnimation() {
    this.methodesGlobal.nonAfficher('contenu-interface');
    this.methodesGlobal.afficher('load-import');
  }

  nonAfficherAnimation() {
    this.methodesGlobal.afficher('contenu-interface');
    this.methodesGlobal.nonAfficher('load-import');
  }

  async updateStatistiques(annee: string) {
    try {
      let that = this;
      this.afficherAnimation();
      this.methodesGlobal.nonAfficher('contenu-form');
      this.statistiques$ = this.updateStatistique.updateStatistique(annee);
      await this.statistiques$.toPromise().then(res => {
        for (let i = 0; i < res.length; i++) {
          this.totalUpdate = res[i];
        }
        setTimeout(async function () {
          that.nonAfficherAnimation();
        }, 3000);
        this.methodesGlobal.nonAfficher('contenu-resultat');
        this.methodesGlobal.afficher('contenu-form');
        this.methodesGlobal.afficher('result-update');
      });
    } catch (err: any) {
      console.error(`Error : ${err.Message}`);
    }
  }

  async ExportTOExcel() {
    setTimeout(async function () {
      let dateNow = new Date().getUTCDate();
      let element = document.getElementById('table-rapport');
      const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Rapport-statistique-' + dateNow);
      XLSX.writeFile(wb, 'resultats-importation.xlsx');
    }, 3000);
  }
}
