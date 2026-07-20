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
  // Map idP -> valeur, construites une fois apres la reception des notes/prix
  // (evite un balayage lineaire du tableau pour chaque ligne du rapport).
  notesParId: Map<string, string> = new Map();
  prixParId: Map<string, string> = new Map();
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

  async remplireAutresChampsPeriodiques(){
    try {
      this.periodiquesAutres$ = this.periodiqueServices.fetchRapportChampsAutres(this.filtres);
      await this.periodiquesAutres$.toPromise().then(res => {
        this.notesPeriodique = res['notes'];
        this.prixPeriodique = res['prix'];
        this.notesParId = new Map(this.notesPeriodique.map((n: any) => [n.idP, n.notes]));
        this.prixParId = new Map(this.prixPeriodique.map((p: any) => [p.idP, p.prix]));
        //this.coresPeriodique = res['cores'];
        //this.archivesPeriodique = res['archives'];
      });

    } catch(err) {
      console.error(`Error : ${err.Message}`);
    }
  }

  // Recherche O(1) (Map deja construite dans remplireAutresChampsPeriodiques) au lieu
  // d'un balayage lineaire du tableau notes/prix pour chaque ligne du rapport.
  donneesAutresChamps(map: Map<string, string>, idP: string){
    return map.has(idP) ? map.get(idP) : '-';
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

//liste des periodique — le filtrage (statut, domaine, secteur, abonnement, bdd,
// accesCourant, essentiel2014/2022, fournisseur, libreAcces, plateformePrincipale,
// autrePlateforme) est fait cote serveur (this.filtres envoye tel quel en query
// params) : plus de double boucle client O(lignes x filtres) avec des .includes()
// de sous-chaine fragiles.
  async creerTableauPeriodique() {
    if (this.isLoadingResults) return;
    try {
      this.isLoadingResults = true;
      this.listePeriodique=[]
      this.afficherAnimation()

      this.periodiques$ = this.periodiqueServices.fetchRapportAll(this.filtres);
      //chercher les autres champs (memes filtres)
      await this.remplireAutresChampsPeriodiques();
      // @ts-ignore
      this.periodiques$.toPromise().then(res => {
        for (let i = 0; i < res.length; i++) {
          this.listePeriodique[i]={
            "No":i+1,
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
            "notes":this.donneesAutresChamps(this.notesParId,res[i].idP),
            "prix":this.donneesAutresChamps(this.prixParId,res[i].idP),
            //"cores":this.donneesAutresChamps(this.coresPeriodique,res[i].idP,'cores'),
            //"archives":this.donneesAutresChamps(this.archivesPeriodique,res[i].idP,'archives'),
            "dateA":res[i].dateA,
            "dateM":res[i].dateM
          }
        }
        // Redéfinir le contenu de la table avec la pagination est la recherche une fois que le resultat de la bd est returné
        this.dataSourcesCreation(this.listePeriodique);
        this.isLoadingResults = false;
      });

      //console.log(this.listePeriodique)
    } catch(err) {
      console.error(`Error : ${err.Message}`);
      //afficher le tableau
      this.nonAfficherAnimation();
      this.isLoadingResults = false;
    }
  }

  //creation des th selon les case qui sont cauchée
  creationThTable($event: any): void{
    let checked
      checked = $event.target.checked;
    //si cauché
      if (checked) {
        // eviter un doublon (et donc une colonne en trop / une colonne manquante dans le
        // tableau de resultats) si l'evenement se declenche deux fois pour la meme case
        if (!this.thTableau.includes($event.target.value)) {
          this.thTableau.push($event.target.value)
        }
      } else {
        // @ts-ignore
        this.thTableau.forEach((element,index)=>{
          if(element==$event.target.value) this.thTableau.splice(index,1);
        });
      }
  }

  // Indique si un champ est actuellement sélectionné pour le rapport
  isChampCoche(champ: string): boolean {
    return this.thTableau.includes(champ);
  }

  // Vrai si tous les champs disponibles sont cochés (meme ensemble, pas juste meme longueur —
  // sinon un doublon combine a un champ manquant afficherait "tout coché" a tort)
  get tousLesChampsCoches(): boolean {
    return this.champs.length > 0
      && this.thTableau.length === this.champs.length
      && this.champs.every((c: string) => this.thTableau.includes(c));
  }

  // Coche ou décoche tous les champs d'un seul coup
  toggleTousLesChamps(): void {
    this.thTableau = this.tousLesChampsCoches ? [] : [...this.champs];
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
