import {Component, OnInit, AfterViewInit, ViewChild} from '@angular/core';
import {PeriodiqueListeService} from "../../../services/periodique-liste.service";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import type {Sort} from "@angular/material/sort";
import { MatPaginator } from '@angular/material/paginator';
import {MethodesGlobal} from "../../../lib/MethodesGlobal";
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../lib/confirm-suppression-dialog.component';

@Component({
  selector: 'app-periodique-liste',
  templateUrl: './periodique-liste.component.html',
  styleUrls: ['./periodique-liste.component.css']
})
export class PeriodiqueListeComponent implements OnInit, AfterViewInit {
  //les entêts du tableau
  displayedColumns = ['idRevue', 'titre', 'ISSN', 'EISSN','secteur','domaine','abonnement','bdd','statut','dateA','dateM','consulter'];
  listePeriodiques: ListePeriodique[] = [];
  // @ts-ignore
  dataSource: MatTableDataSource<ListePeriodique>;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator | any;
  @ViewChild(MatSort, { static: false })  matSort : MatSort | any;

  //importer les fonctions global
  methodesGlobal: MethodesGlobal = new MethodesGlobal();

  //prendre la valeur d'un input
  getValue(value:string){
    return value.trim();
  }

  //garder les titre rechercher dans les filtres
  textRechercher='';

  isLoading = true;

  ifAdmin=false;

  // Pagination manuelle
  currentPage = 0;
  pageSize = 25;
  totalItems = 0;
  pageSizeOptions = [25, 50, 75, 100, 150];

  // Tri serveur
  sortColumn = 'titre';
  sortDirection = 'asc';

  constructor(
    private periodiqueListeService: PeriodiqueListeService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit():void {
    this.textRechercher = this.historiqueRechercheZone();
    this.ifAdmin = this.methodesGlobal.ifAdminFunction();
    // Restaurer l'état de pagination et de tri depuis la session précédente
    const savedPage = localStorage.getItem('currentPage');
    const savedSize = localStorage.getItem('pageSize');
    const savedSortCol = localStorage.getItem('sortColumn');
    const savedSortDir = localStorage.getItem('sortDirection');
    if (savedPage) { this.currentPage = parseInt(savedPage, 10); }
    if (savedSize) { this.pageSize = parseInt(savedSize, 10); }
    if (savedSortCol) { this.sortColumn = savedSortCol; }
    if (savedSortDir) { this.sortDirection = savedSortDir; }
  }

  ngAfterViewInit():void {
    // Initialiser la datasource sans tri client (le tri est géré côté serveur)
    this.dataSource = new MatTableDataSource(this.listePeriodiques);

    // Écouter les changements de tri et déclencher un rechargement serveur
    this.matSort.sortChange.subscribe((sort: Sort) => {
      this.sortColumn = sort.active || 'titre';
      this.sortDirection = sort.direction || 'asc';
      this.currentPage = 0;
      this.loadPeriodiques(this.prepareSearch(this.textRechercher));
    });

    this.loadPeriodiques(this.prepareSearch(this.textRechercher));
  }

  // Charger les périodiques depuis le backend avec pagination
  loadPeriodiques(searchTerm = '') {
    this.isLoading = true;

    const pageIndex = this.currentPage || 0;
    const pageSize = this.pageSize;
    const skip = pageIndex * pageSize;
    const limit = pageSize;

    // Persister l'état complet pour retour depuis une fiche
    localStorage.setItem('currentPage', pageIndex.toString());
    localStorage.setItem('pageSize', pageSize.toString());
    localStorage.setItem('sortColumn', this.sortColumn);
    localStorage.setItem('sortDirection', this.sortDirection);

    this.periodiqueListeService.fetchAllPaginated(skip, limit, searchTerm, this.sortColumn, this.sortDirection)
      .subscribe({
        next: (response) => {
          let dataToMap: any[] = [];
          if (response?.data) {
            // Cas [rows, fields] ou tableau direct
            dataToMap = Array.isArray(response.data[0]) ? response.data[0] : response.data;
          }

          this.listePeriodiques = dataToMap.map((item: any) =>
            createListePeriodique(
              item.idRevue || '', item.titre || '', item.ISSN || '', item.EISSN || '',
              item.secteur || '', item.domaine || '', item.abonnement || '',
              item.bdd || '', item.statut || '', item.dateA || '', item.dateM || ''
            )
          );

          this.dataSource.data = this.listePeriodiques;
          this.totalItems = response?.total || 0;
          this.isLoading = false;
        },
        error: (err) => {
          console.error(`Erreur chargement périodiques : ${err}`);
          this.isLoading = false;
        }
      });
  }

  // Supprime uniquement les diacritiques (accents), conserve les caractères spéciaux comme les tirets ISSN
  private prepareSearch(value: string): string {
    // eslint-disable-next-line no-misleading-character-class
    const diacritics = new RegExp('[\\u0300-\\u036f]', 'g');
    return value.normalize('NFD').replace(diacritics, '').toLowerCase().trim();
  }

  //appliquer filtre avec ignore accents
  applyFilter(filterValue: string) {
    localStorage.setItem('textFiltre', filterValue);
    this.textRechercher = filterValue.trim();
    this.currentPage = 0;
    this.loadPeriodiques(this.prepareSearch(this.textRechercher));
  }

  // Méthode pour naviguer vers une fiche (à appeler quand on clique sur un élément)
  consulterFiche(id: string) {
    this.router.navigate([`/periodique-fiche/${id}`]);
  }

  // ===== PAGINATION MANUELLE =====
  
  nextPage(): void {
    if (!this.isLastPage()) { this.currentPage++; this.loadPeriodiques(this.textRechercher); }
  }

  previousPage(): void {
    if (this.currentPage > 0) { this.currentPage--; this.loadPeriodiques(this.textRechercher); }
  }

  goToPage(pageNumber: number): void {
    const maxPage = Math.ceil(this.totalItems / this.pageSize) - 1;
    if (pageNumber >= 0 && pageNumber <= maxPage) {
      this.currentPage = pageNumber;
      this.loadPeriodiques(this.textRechercher);
    }
  }

  firstPage(): void {
    this.currentPage = 0;
    this.loadPeriodiques(this.textRechercher);
  }

  lastPage(): void {
    this.currentPage = Math.ceil(this.totalItems / this.pageSize) - 1;
    this.loadPeriodiques(this.textRechercher);
  }

  changePageSize(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 0;
    this.loadPeriodiques(this.textRechercher);
  }

  /**
   * Vérifie si c'est la première page
   */
  isFirstPage(): boolean {
    return this.currentPage === 0;
  }

  /**
   * Vérifie si c'est la dernière page
   */
  isLastPage(): boolean {
    const maxPage = Math.ceil(this.totalItems / this.pageSize) - 1;
    return this.currentPage >= maxPage;
  }

  /**
   * Obtient le numéro de page actuelle (1-indexed pour l'affichage)
   */
  getCurrentPageNumber(): number {
    return this.currentPage + 1;
  }

  /**
   * Obtient le nombre total de pages
   */
  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  /**
   * Premier élément affiché sur la page courante (1-indexed)
   */
  getDisplayStart(): number {
    return this.totalItems === 0 ? 0 : this.currentPage * this.pageSize + 1;
  }

  /**
   * Dernier élément affiché sur la page courante
   */
  getDisplayEnd(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalItems);
  }

  /**
   * Génère la liste des numéros de pages à afficher (null = ellipsis)
   */
  getPageNumbers(): (number | null)[] {
    const total = this.getTotalPages();
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const current = this.getCurrentPageNumber();
    const pages: (number | null)[] = [1];
    if (current > 3) { pages.push(null); }
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) { pages.push(i); }
    if (current < total - 2) { pages.push(null); }
    pages.push(total);
    return pages;
  }

  //garder les key pour le filtre de recherche
  historiqueRechercheZone(){
    let result='';
    // @ts-ignore
    let textFiltre=document.getElementById('textFiltre')?.value;
    if(textFiltre && textFiltre!='')
      localStorage.setItem('textFiltre',textFiltre);

    if(localStorage.getItem('textFiltre'))
    { // @ts-ignore
      result=localStorage.getItem('textFiltre');
    }

    return result;
  }

  supprimerPeriodique(id: string, titre: string): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        titre: 'Confirmation de suppression',
        message: `Êtes-vous sûr de vouloir supprimer le périodique "${titre}" ?`,
        confirmLabel: 'Supprimer',
        confirmColor: 'warn'
      }
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.periodiqueListeService.delete(Number(id)).subscribe({
          next: () => this.loadPeriodiques(this.prepareSearch(this.textRechercher)),
          error: (err) => console.error(`Erreur suppression périodique : ${err}`)
        });
      }
    });
  }

  //vider le filtre
  viderFiltre(){
    let input = document.getElementById('textFiltre') as HTMLInputElement;
    if(input){
      input.value='';
      localStorage.setItem('textFiltre','');
      this.textRechercher = '';
      this.currentPage = 0;
      this.loadPeriodiques('');
    }
  }


}

/** Fonction pour remplire le tableau de la liste des periodiques */
function createListePeriodique(idRevueP: number,titreP:string,ISSNP:string,EISSNP:string,secteurP:string,domaineP:string,abonnementP:string,bddP:string,statutP:string,dateAP:string,dateMP:string): ListePeriodique {
  return {
    idRevue: idRevueP.toString(),
    titre: titreP,
    ISSN: ISSNP,
    EISSN: EISSNP,
    secteur: secteurP,
    domaine: domaineP,
    abonnement: abonnementP,
    bdd: bddP,
    statut: statutP,
    dateA: dateAP,
    dateM: dateMP,
    consulter: '',
  };
}

/** Class utilisée pour remplire le tableau avec la liste des périodiques**/
export interface ListePeriodique {
  idRevue: string;
  titre: string;
  ISSN: string;
  EISSN: string;
  secteur: string;
  domaine: string;
  abonnement: string;
  bdd: string;
  statut: string;
  dateA: string;
  dateM: string;
  consulter:string;
}
