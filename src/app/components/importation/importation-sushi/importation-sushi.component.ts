import {Component, OnInit, ViewChild} from '@angular/core';
import {MethodesGlobal} from "../../../lib/MethodesGlobal";
import {Observable} from "rxjs";
import {OutilsService} from "../../../services/outils.service";
import {ImportationSushiService} from "../../../services/importation-sushi.service";
import {Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {UpdateStatistiqueService} from "../../../services/update-statistique.service";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {paginationPersonnalise} from "../../../lib/paginationPersonnalise";
import * as XLSX from "xlsx";
import {MatSort} from "@angular/material/sort";


@Component({
  selector: 'app-importation-sushi',
  templateUrl: './importation-sushi.component.html',
  styleUrls: ['./importation-sushi.component.css']
})
export class ImportationSushiComponent implements OnInit {
  //creation d'objet avec la liste des periodiques
  // @ts-ignore
  listeRaports: any = {};
  id: string | null | undefined ;
  listeRaports$: Observable<any[]> | undefined;
  //les entêts du tableau
  displayedColumns = ['numero','PlatformID', 'ISSN','EISSN','Title','annee','Metric_Type','Reporting_Period_Total','dateA'];
  tableauRapports: any = [];

  // @ts-ignore
  dataSource: MatTableDataSource<ListeStatistique>;
  @ViewChild(MatPaginator) paginator: paginationPersonnalise | any;

  @ViewChild(MatSort)  matSort : MatSort | any;

//importer les fonctions global
  methodesGlobal: MethodesGlobal = new MethodesGlobal();

  //creer la liste des plateforme
  plateformes$: Observable<any> | undefined;
  listePlateforme: any = [];

  //reponse sur l'update des données
  statistiques$: Observable<any> | undefined;


  donnees$: Observable<any> | undefined;
  listeImport: any = [];

  //Initialiser le tableau d'annee'
  arrayAnnee:any[]=[];

  //total statistique updaté
  totalUpdate=-1


  constructor(private plateformeService: OutilsService,
              private router: Router,
              private translate: TranslateService,
              private api: ImportationSushiService,
              private updateStatistique: UpdateStatistiqueService) { }
  //elements for progresse bar

  ngOnInit(): void {
      //remplire la liste des plateforme
      this.creerTableauPlateforme();
     //remplire la liste des annees
      this.anneeOptions()

  }

  //appliquer filtre
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    // @ts-ignore
    this.dataSource.filter = filterValue;
  }

  async importer(plateforme:string,annee:string){
      let that=this
      this.afficherAnimation()
      this.donnees$ = await this.api.fetchAll(annee,plateforme)
      await this.donnees$.toPromise().then(res => {
        //console.log(res)
        if(res){
          setTimeout(async function () {
            that.nonAfficherAnimation()
          }, 3000);
          this.methodesGlobal.nonAfficher('contenu-resultat')
          this.methodesGlobal.nonAfficher('result-update')
          this.methodesGlobal.afficher('reponse-importation')
          this.methodesGlobal.afficher('contenu-form')
        }
      })


  }
  async creerTableauPlateforme() {
    try {
      this.plateformes$ = this.plateformeService.fetchAll();
      await this.plateformes$.toPromise().then(res => {
        for (let i = 0; i < res.length; i++) {
          this.listePlateforme[i]={
            "numero":i+1,
            "PlatformID":res[i].PlatformID,
            "titrePlateforme":res[i].titrePlateforme
          }
        }
      });
    } catch(err) {
      console.error(`Error : ${err.Message}`);
    }
  }
  //creation tableau des rapports
  async creerTableauResultat(annee:string, plateforme:string,rapport:string) {
    try {
      this.methodesGlobal.nonAfficher('reponse-importation')
      this.methodesGlobal.nonAfficher('result-update')
      this.tableauRapports=[]
      this.methodesGlobal.nonAfficher('tableauResult')
      this.listeRaports$ = this.plateformeService.resultatRapport(annee,plateforme,rapport);
      await this.listeRaports$.toPromise().then(res => {
        if(res){
          this.methodesGlobal.afficher('filtreResult')
          this.methodesGlobal.afficher('tableauResult')
          this.methodesGlobal.afficher('bouton-actions')
              for (let i = 0; i < res.length; i++) {
                this.tableauRapports[i]={
                  "numero":i+1,
                  "PlatformID":res[i].PlatformID,
                  "ISSN":res[i].ISSN,
                  "EISSN":res[i].EISSN,
                  "Title":res[i].Title,
                  "annee":res[i].annee,
                  "Metric_Type":res[i].Metric_Type,
                  "Reporting_Period_Total":res[i].Reporting_Period_Total,
                  "dateA":res[i].dateA
                }
              }
           //console.log(this.tableauRapports)
          // Redéfinir le contenu de la table avec la pagination est la recherche une fois que le resultat de la bd est returné
          this.dataSource = new MatTableDataSource(this.tableauRapports);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.matSort;
        }
      });
    } catch(err) {
      console.error(`Error : ${err.Message}`);
    }
  }
  //creation du select d'année a partir de 2019
  anneeOptions(){
      let anneeNow=new Date().getFullYear();
      let i=0
      while(i <=(anneeNow-2019)){
        this.arrayAnnee[i]=anneeNow-i
        i++
      }
  }
  //afficher l'animation pour attendre l'importation
  afficherAnimation(){
    this.methodesGlobal.nonAfficher('contenu-interface');
    this.methodesGlobal.afficher('load-import');
  }

  //afficher l'animation pour attendre l'importation
  nonAfficherAnimation(){
    this.methodesGlobal.afficher('contenu-interface');
    this.methodesGlobal.nonAfficher('load-import');
  }

  //mis a jour des données statistiques
  async updateStatistiques(annee:string) {
    try {
      let that=this
      this.afficherAnimation()
      this.methodesGlobal.nonAfficher('contenu-form')
      this.statistiques$ = this.updateStatistique.updateStatistique(annee);
      await this.statistiques$.toPromise().then(res => {
        for (let i = 0; i < res.length; i++) {
          this.totalUpdate=res[i]
        }
        setTimeout(async function () {
          that.nonAfficherAnimation()
        }, 3000);

        this.methodesGlobal.nonAfficher('contenu-resultat')
        this.methodesGlobal.afficher('contenu-form')
        this.methodesGlobal.afficher('result-update')
      });
    } catch(err) {
      console.error(`Error : ${err.Message}`);
    }
  }

  //exporter les données en format xlsx
  async ExportTOExcel()
  {

    setTimeout(async function () {
      let dateNow=new Date().getUTCDate();
      /* table id is passed over here */
      let element = document.getElementById('table-rapport');
      const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);

      /* generate workbook and add the worksheet */
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Rapport-statistique-'+dateNow);

      /* save to file */
      XLSX.writeFile(wb, 'resultats-importation.xlsx');
    }, 3000);

    //console.log(this.dataSource);

  }
}
