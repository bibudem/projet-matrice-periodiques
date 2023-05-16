import {Component,  OnInit, ViewChild} from '@angular/core';
import {MethodesGlobal} from "../../../lib/MethodesGlobal";
import {ListeChoixOptions} from "../../../lib/ListeChoixOptions";
import {Observable} from "rxjs";
import {TranslateService} from "@ngx-translate/core";
import {OutilsService} from "../../../services/outils.service";
import {PeriodiqueListeService} from "../../../services/periodique-liste.service";
import {MatDialog} from '@angular/material/dialog';
import * as XLSX from 'xlsx';
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {paginationPersonnalise} from "../../../lib/paginationPersonnalise";
import {MatSort} from "@angular/material/sort";
import {ListePeriodique} from "../../periodique/periodique-liste/periodique-liste.component";
import { MatTableExporterModule } from 'mat-table-exporter';
import {NgForm} from "@angular/forms";
import {Router} from "@angular/router";

@Component({
  selector: 'app-rapport-periodique',
  templateUrl: './rapport-periodique.component.html',
  styleUrls: ['./rapport-periodique.component.css']
})
export class RapportPeriodiqueComponent implements OnInit {
//importer les fonctions global
  methodesGlobal: MethodesGlobal = new MethodesGlobal();

  //importer les liste des choix
  listeChoixOptions: ListeChoixOptions = new ListeChoixOptions();

  //creer la liste des plateforme
  plateformes$: Observable<any> | undefined;
  listePlateforme: any = [];

  //creer la liste des plateforme
  periodiques$: Observable<any> | undefined;
  listePeriodique: any = [];

  //ajouter les autres champs de la periodiques
  periodiquesAutres$: Observable<any> | undefined;
  listePeriodiqueAutres: any = [];

  fournisseurs$: Observable<any> | undefined;
  listeFounisseurs: any = [];

  notesPeriodique : any = [];
  prixPeriodique : any = [];
  //coresPeriodique : any = [];
  //archivesPeriodique : any = [];
  // @ts-ignore
  dataSource: MatTableDataSource<ListePeriodique>;

  @ViewChild(MatPaginator) paginator: paginationPersonnalise | any;

  @ViewChild(MatSort)  matSort : MatSort | any;

  champsTitre : any = [];

  champs=[];

  champsAutresTitre : any = [];

  champsAutres=[];

//variable boolean
  isLoadingResults=false;

  thTableau:any=[];


  filtres:any=[];

  /*name of the excel-file which will be downloaded. */
  fileName= 'rapport-periodique.xlsx';

  totalDonnees=0;

  link =false;


  constructor(
              private plateformeService: OutilsService,
              private periodiqueServices: PeriodiqueListeService,
              public dialog: MatDialog,
              public exporter: MatTableExporterModule,
              private translate:TranslateService,
              private router: Router,) { }

  async ngOnInit() {
    //remplire la liste des plateforme
    this.creerTableauPlateforme();

    this.creerTableauFournisseurs();

    //cacher le bouton export
    this.methodesGlobal.nonAfficher('contenuRapport');

    this.titreChamp();
    this.titreChampAutres();

  }

  async remplireAutresChampsPeriodiques(plateforme:string){
    try {
      this.periodiquesAutres$ = this.periodiqueServices.fetchRapportChampsAutres(plateforme);
      await this.periodiquesAutres$.toPromise().then(res => {
        this.notesPeriodique = res['notes'];
        this.prixPeriodique = res['prix'];
        //this.coresPeriodique = res['cores'];
        //this.archivesPeriodique = res['archives'];
      });

    } catch(err) {
      console.error(`Error : ${err.Message}`);
    }
  }

  donneesAutresChamps(array:any, idP:string, champ:string){
    let result = '-';
    if(array.length==0)
       return result;

    for(let i = 0; i < array.length;i++){
      if(array[i]['idP']==idP){
        result = array[i][champ];
      }
    }
    return result
  }

  async creerTableauPlateforme() {
    try {
      this.plateformes$ = this.plateformeService.fetchAll();
      // @ts-ignore
      await this.plateformes$.toPromise().then(res => {
        for (let i = 0; i < res.length; i++) {
          this.listePlateforme[i]={
            "numero":i+1,
            "idPlateforme":res[i].idPlateforme,
            "titrePlateforme":res[i].titrePlateforme
          }
        }
      });
    } catch(err) {
      console.error(`Error : ${err.Message}`);
    }
  }

//liste des periodique
  async creerTableauPeriodique(plateforme: string) {
    try {
      this.listePeriodique=[]
      this.afficherAnimation()
      let result = Object.entries(this.filtres);

      this.periodiques$ = this.periodiqueServices.fetchRapportAll(plateforme);
        //chercher les autres champs
        await this.remplireAutresChampsPeriodiques(plateforme);
        // @ts-ignore
         this.periodiques$.toPromise().then(res => {
          let k,j=0;
          for (let i = 0; i < res.length; i++) {
            k=0;
            for ( let [key,elem] of result){
              // @ts-ignore
              if( res[i][key]!==null && res[i][key]!=='' && elem.includes(res[i][key])){
                k++;
              }
            }
            if(k==result.length){
              this.listePeriodique[j]={
                "No":j+1,
                "id":res[i].idP,
                "titre":res[i].titre,
                "ISSN":res[i].ISSN,
                "EISSN":res[i].EISSN,
                "statut":res[i].statut,
                "accesCourant":res[i].accesCourant,
                "abonnement":res[i].abonnement,
                "libreAcces":res[i].libreAcces,
                "domaine":res[i].domaine,
                "secteur":res[i].secteur,
                "bdd":res[i].bdd,
                "sujets":res[i].sujets,
                "entente_consortiale":res[i].entente_consortiale,
                "fonds":res[i].fonds,
                "fournisseur":res[i].fournisseur,
                "plateformePrincipale":res[i].plateformePrincipale,
                "autrePlateforme":res[i].autrePlateforme,
                "format":res[i].format,
                "duplication":res[i].duplication,
                "duplicationCourant":res[i].duplicationCourant,
                "duplicationEmbargo1":res[i].duplicationEmbargo1,
                "duplicationEmbargo2":res[i].duplicationEmbargo2,
                "prixUtil":res[i].prixUtil,
                "essentiel2014":res[i].essentiel2014,
                "essentiel2022":res[i].essentiel2022,
                "notes":this.donneesAutresChamps(this.notesPeriodique,res[i].idP,'notes'),
                "prix":this.donneesAutresChamps(this.prixPeriodique,res[i].idP,'prix'),
                //"cores":this.donneesAutresChamps(this.coresPeriodique,res[i].idP,'cores'),
                //"archives":this.donneesAutresChamps(this.archivesPeriodique,res[i].idP,'archives'),
                "dateA":res[i].dateA,
                "dateM":res[i].dateM
              }
              j++
            }
          }
          // Redéfinir le contenu de la table avec la pagination est la recherche une fois que le resultat de la bd est returné
          this.dataSourcesCreation(this.listePeriodique);
        });

      //console.log(this.listePeriodique)
    } catch(err) {
      console.error(`Error : ${err.Message}`);
      //afficher le tableau
      this.nonAfficherAnimation();

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
      this.filtres[$event.target.id]=$event.target.value;
    }else{
      delete this.filtres[$event.target.id];
    }
   //console.log(this.filtres)
  }
  //apliquer les filtre from material
  implimentationMatFiltre($event: any,id:string){
    if($event!=''){
      this.filtres[id]=$event.toString();
    }else{
      delete this.filtres[id];
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
    this.translate.get('labels-rapport-periodique').subscribe((res: any) => {
      let result = Object.entries(res);
      // console.log(typeof(result))
      for(let [key,val] of result){
            this.champsTitre[key]=val
            // @ts-ignore
            this.champs.push(key)

      }
    });
  }

  //remplire les titre pour les case a caucher
  titreChampAutres(){
    this.translate.get('labels-rapport-periodique-autres').subscribe((res: any) => {
      let result = Object.entries(res);
      // console.log(typeof(result))
      for(let [key,val] of result){
        this.champsAutresTitre[key]=val
        // @ts-ignore
        this.champsAutres.push(key)

      }
    });
  }

  dataSourcesCreation(liste:any){
    this.dataSource = new MatTableDataSource(liste);
    this.dataSource.paginator = this.paginator;
    this.totalDonnees=liste.length;
    this.dataSource.sort = this.matSort;
    //afficher le tableau
    this.nonAfficherAnimation();
  }

  //liste des fournisseurs
  async creerTableauFournisseurs() {
    try {
      this.fournisseurs$ = this.plateformeService.allFournisseurs();
      // @ts-ignore
      await this.fournisseurs$.toPromise().then(res => {
        for (let i = 0; i < res.length; i++) {
          this.listeFounisseurs[i]={
            "numero":i+1,
            "titre":res[i].titre
          }
        }
      });
    } catch(err) {
      console.error(`Error : ${err.Message}`);
    }
  }
}
