import {Component, OnInit, ViewChild} from '@angular/core';
import {MethodesGlobal} from "../../../lib/MethodesGlobal";
import {ListeChoixOptions} from "../../../lib/ListeChoixOptions";
import {Observable} from "rxjs";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {paginationPersonnalise} from "../../../lib/paginationPersonnalise";
import {MatSort} from "@angular/material/sort";
import {OutilsService} from "../../../services/outils.service";
import {MatTableExporterModule} from "mat-table-exporter";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-rapport-moyenne',
  templateUrl: './rapport-moyenne.component.html',
  styleUrls: ['./rapport-moyenne.component.css']
})
export class RapportMoyenneComponent implements OnInit {
//importer les fonctions global
  methodesGlobal: MethodesGlobal = new MethodesGlobal();

  //importer les liste des choix
  listeChoixOptions: ListeChoixOptions = new ListeChoixOptions();

  //creer la liste des plateforme
  plateformes$: Observable<any> | undefined;
  listePlateforme: any = [];

  //creer la liste des plateforme
  rapport$: Observable<any> | undefined;
  listeRapport: any = [];

  // @ts-ignore
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: paginationPersonnalise | any;

  @ViewChild(MatSort)  matSort : MatSort | any;

  champsTitre : any = [];

  champs=[]

//variable boolean
  isLoadingResults=false

  thTableau:any=[]


  filtres:any=[]

  /*name of the excel-file which will be downloaded. */
  fileName= 'rapport-moyenne.xlsx';

  totalDonnees=0

  constructor(private moyenneService: OutilsService,
              public exporter: MatTableExporterModule,
              private translate:TranslateService) { }

  async ngOnInit() {
    //remplire la liste des plateforme
    this.creerTableauPlateforme();
    //cacher le bouton export
    this.methodesGlobal.nonAfficher('contenuRapport');
    this.titreChamp();
  }


  async creerTableauPlateforme() {
    try {
      this.plateformes$ = this.moyenneService.fetchAll();
      // @ts-ignore
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

  async creerTableauRapport() {
    try {
      this.rapport$ = this.moyenneService.rapportMoyenne();
      this.listeRapport=[]
      this.afficherAnimation()
      let resultFiltre = Object.entries(this.filtres);
      let k=0,i=0;
      // @ts-ignore
      await this.rapport$.toPromise().then(res => {
        if(res!==undefined){
          for (let val of res) {
            k=0;
            for ( let [key,elem] of resultFiltre){
              if(elem== val[key]) {
                k++
              }
            }
            if(k==resultFiltre.length){
              this.listeRapport[i]={
                "Nr":1,
                "annees":val.annees,
                "idRevue":val.IdS,
                "titre":val.titre,
                "ISSN":val.ISSN,
                "EISSN":val.EISSN,
                "statut":val.statut,
                "essentiel2014":val.essentiel2014,
                "essentiel2022":val.essentiel2022,
                "plateforme":val.plateforme,
                "total_tel":val.moyenn_t,
                "total_ref":val.moyenn_r,
                "total_cit":val.moyenn_c,
                "total_artU":val.moyenn_a
              }
              i++;
            }

          }
        }

        //console.log(this.listeRapport)
        // Redéfinir le contenu de la table avec la pagination est la recherche une fois que le resultat de la bd est returné
        this.dataSource = new MatTableDataSource(this.listeRapport);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.matSort;
        this.totalDonnees=this.listeRapport.length
        //afficher le tableau
        this.nonAfficherAnimation()
      });
    } catch(err) {
      console.error(`Error : ${err.Message}`);
    }
  }

  //creation des th selon les case qui sont cauchée
  creationThTable($event: any): void{
    let checked
    checked = $event.target.checked;
    //si cauché
    if (checked) {
      this.thTableau.push( $event.target.value)
    } else {
      // @ts-ignore
      this.thTableau.forEach((element,index)=>{
        if(element==$event.target.value) this.thTableau.splice(index,1);
      });
    }
  }

//apliquer les filtre pour le rapport
  implimentationFiltre($event: any){
    if($event.target.value!=''){
      this.filtres[$event.target.id]=$event.target.value
    }else{
      delete this.filtres[$event.target.id];
    }
    //console.log(this.filtres)
  }

  //afficher animation
  afficherAnimation(){
    this.methodesGlobal.nonAfficher('page-rapport')
    this.methodesGlobal.afficher('load-import')
  }

  nonAfficherAnimation(){
    this.methodesGlobal.afficher('contenuRapport')
    let that=this
    setTimeout(async function () {
      that.methodesGlobal.nonAfficher('load-import')
      that.methodesGlobal.afficher('page-rapport')
    }, 1500);
  }

  //remplire les titre pour les case a caucher
  titreChamp(){
    this.translate.get('labels-rapport-moyenne').subscribe((res: any) => {
      let result = Object.entries(res);
      // console.log(typeof(result))
      for(let [key,val] of result){
        //console.log(typeof(val))
        this.champsTitre[key]=val
        // @ts-ignore
        this.champs.push(key)
      }
    });
  }
}
