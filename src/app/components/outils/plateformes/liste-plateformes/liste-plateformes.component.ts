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

@Component({
  selector: 'app-liste-plateformes',
  templateUrl: './liste-plateformes.component.html',
  styleUrls: ['./liste-plateformes.component.css']
})
export class ListePlateformesComponent implements OnInit {
  plateformes$: Observable<any[]> | undefined;

  //creation d'objet avec la liste des periodiques
  // @ts-ignore
  public plateforme: Plateforme = {};
  id: string | null | undefined ;
  //les entêts du tableau
  displayedColumns = ['numero', 'PlatformID','titrePlateforme','dateM','consulter'];
  listePlateforme: any = [];
  // @ts-ignore
  dataSource: MatTableDataSource<listePlateformes>;
  @ViewChild(MatPaginator) paginator: paginationPersonnalise | any;

  @ViewChild(MatSort)  matSort : MatSort | any;

  //importer les fonctions global
  methodesGlobal: MethodesGlobal = new MethodesGlobal();

  bouttonAction='';

  constructor(private periodiquePlateformeService: OutilsService,
              private translate: TranslateService) { }

  //appliquer filtre
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    // @ts-ignore
    this.dataSource.filter = filterValue;
  }

  ngOnInit(): void {
    this.creerTableau();
  }

  //fonction doit etre async pour attendre la reponse de la bd
  async creerTableau() {
    try {
      //recouperer le bon titre du bouton
      this.translate.get('btn-ajouter-plateforme').subscribe((res: string) => {
        this.bouttonAction=res;
      });
        this.plateformes$ = await this.fetchAll();
        await this.plateformes$.toPromise().then(res => {
          for (let i = 0; i < res.length; i++) {
            this.listePlateforme[i]={
              "numero":i+1,
              "idPlateforme":res[i].idPlateforme,
              "PlatformID":res[i].PlatformID,
              "titrePlateforme":res[i].titrePlateforme,
              "dateM":res[i].dateM
            }
          }
          // Redéfinir le contenu de la table avec la pagination est la recherche une fois que le resultat de la bd est returné
          this.dataSource = new MatTableDataSource(this.listePlateforme);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.matSort;
          //console.log(this.dataSource);
        });
    } catch(err) {
      console.error(`Error : ${err.Message}`);
      //
    }
  }

  //consulter fiche
  consulter(id: number) {
    //conserver  l'id de la plateforme
    localStorage.setItem('idPlateforme',id.toString());
    localStorage.setItem('action','save');
  /* this.methodesGlobal.reload('plateforme-form').then(r =>
   console.log(id));*/
  }
  //recouperer la liste des periodiques
  fetchAll(): Observable<Plateforme[]> {
    return this.periodiquePlateformeService.fetchAll();
  }
  //lien vers le form d'un ajout d'une plateforme
  addPlateform(){
    localStorage.setItem('action','add-plateforme');
    localStorage.setItem('idPlateforme','');
  }
}

