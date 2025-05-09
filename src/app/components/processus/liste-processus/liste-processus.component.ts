import {Component, OnInit, ViewChild} from '@angular/core';
import {Observable} from "rxjs";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {paginationPersonnalise} from "../../../lib/paginationPersonnalise";
import {MatSort} from "@angular/material/sort";
import {MethodesGlobal} from "../../../lib/MethodesGlobal";
import {ProcessusService} from "../../../services/processus.service";
import {TranslateService} from "@ngx-translate/core";
import {tap} from "rxjs/operators";
import * as XLSX from "xlsx";
import {Router} from "@angular/router";

@Component({
  selector: 'app-liste-processus',
  templateUrl: './liste-processus.component.html',
  styleUrls: ['./liste-processus.component.css']
})
export class ListeProcessusComponent implements OnInit {

  processus$: Observable<any[]> | undefined;

  codes:any=[];

  isLoading = true;

  //les entêts du tableau
  displayedColumns = ['id_processus','titre','annee','plateforme','admin','h_debut','h_fin','statut','note','details','supprimer'];
  listeProcessus: any = [];
  // @ts-ignore
  dataSource: MatTableDataSource<any>;

  selectedProcessus: string | undefined;

  @ViewChild(MatPaginator) paginator: paginationPersonnalise | any;

  @ViewChild(MatSort)  matSort : MatSort | any;

  // @ts-ignore
  @ViewChild('closebutton') closebutton:any;

  //importer les fonctions global
  methodesGlobal: MethodesGlobal = new MethodesGlobal();

  /*name of the excel-file which will be downloaded. */
  fileName= 'liste-processus.xlsx';

  routerChek :string = ''

  constructor(private processusService: ProcessusService,
              private translate:TranslateService,
              private router: Router) { }

  //appliquer filtre
  applyFilter(filterValue: string) {
    const normalizedFilter = this.methodesGlobal.normalizeString(filterValue);
    this.dataSource.filter = normalizedFilter;
  }

  ngOnInit(): void {
    this.getAllProcessus();
    //lire l'url
    this.routerChek = this. router.url.toString();

  }
  async getAllProcessus() {
    try {
      this.listeProcessus=[]
      this.processus$ = this.processusService.fetchAll();
      // @ts-ignore
      await this.processus$.toPromise().then(res => {
        //console.log(res);
        for (let i = 0; i < res.length; i++) {
          this.listeProcessus[i]={
            "id_processus":res[i].idP,
            "titre":res[i].titre,
            "annee":res[i].annee,
            "plateforme":res[i].plateforme,
            "admin":res[i].admin,
            "h_debut":res[i].h_debut,
            "h_fin":res[i].h_fin,
            "statut":res[i].statut,
            "note":res[i].note
          }
        }
        // Redéfinir le contenu de la table avec la pagination est la recherche une fois que le resultat de la bd est returné
        this.dataSource = new MatTableDataSource(this.listeProcessus);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.matSort;
        // 🔧 Appliquer un filtre personnalisé
        this.dataSource.filterPredicate = (data: any, filter: string) => {
          const normalizedFilter = this.methodesGlobal.normalizeString(filter);

          // Normalise les champs du processus que tu veux inclure dans la recherche
          const normalizedTitre = this.methodesGlobal.normalizeString(data.titre);
          const normalizedAnnee = this.methodesGlobal.normalizeString(data.annee?.toString() ?? '');
          const normalizedPlateforme = this.methodesGlobal.normalizeString(data.plateforme ?? '');

          // 👉 Ajoute d'autres champs si nécessaire

          // Match si le filtre correspond à un champ quelconque
          return (
            normalizedTitre.includes(normalizedFilter) ||
            normalizedAnnee.includes(normalizedFilter) ||
            normalizedPlateforme.includes(normalizedFilter)
          );
        };
        this.isLoading = false;
      });
    } catch(err) {
      console.error(`Error : ${err.Message}`);
    }
  }

  async deleteProcessus(id:string){
    let idP=Number(id)
    this.processus$ = this.processusService
      .delete(idP)
      .pipe(tap(() => (this.getAllProcessus())));
  }

  linkCreerProcessus(routeLink:string):void{

    this.closebutton.nativeElement.click();
    //console.log(routeLink);
    this.router.navigateByUrl(routeLink);
  }

  detailsProcessous(id:string){
    this.router.navigate(['/processus/details/'+id])
  }

  addContenuNote(note:string){
    // @ts-ignore
    document.getElementById("note-contenu").innerHTML = note.toString();
  }

}
