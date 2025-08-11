import {Component, OnInit, ViewChild} from '@angular/core';
import {MethodesGlobal} from "../../../lib/MethodesGlobal";
import {ListeChoixOptions} from "../../../lib/ListeChoixOptions";
import {Observable} from "rxjs";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {paginationPersonnalise} from "../../../lib/paginationPersonnalise";
import {MatSort} from "@angular/material/sort";
import {TranslateService} from "@ngx-translate/core";
import * as XLSX from "xlsx";
import {ListeStatistiquesService} from "../../../services/liste-statistiques.service";
import {OutilsService} from "../../../services/outils.service";

@Component({
  selector: 'app-rapport-statistique',
  templateUrl: './rapport-statistique.component.html',
  styleUrls: ['./rapport-statistique.component.css']
})
export class RapportStatistiqueComponent implements OnInit {

  //Initialiser le tableau d'annee'
  arrayAnnee:any[]=[];
//importer les fonctions global
  methodesGlobal: MethodesGlobal = new MethodesGlobal();

  //importer les liste des choix
  listeChoixOptions: ListeChoixOptions = new ListeChoixOptions();

  //creer la liste des plateforme
  statistiques$: Observable<any> | undefined;


  listeStatistique: any = [];
  // @ts-ignore
  dataSource: MatTableDataSource<listeStatistique>;

  @ViewChild(MatPaginator) paginator: paginationPersonnalise | any;

  @ViewChild(MatSort)  matSort : MatSort | any;

  champsTitre : any = [];

  champs=[]

//variable boolean
  isLoadingResults=false;

  thTableau:any=[]


  filtres:any=[]

  /*name of the excel-file which will be downloaded. */
  fileName= 'rapport-statistiques.xlsx';

  totalDonnees=0

  //creer la liste des plateforme
  plateformes$: Observable<any> | undefined;
  listePlateforme: any = [];

  fournisseurs$: Observable<any> | undefined;
  listeFounisseurs: any = [];

  constructor(private translate: TranslateService,
              private statistiqueService: ListeStatistiquesService,
              private plateformeService: OutilsService) { }

  ngOnInit(): void {
    //cacher le bouton export
    this.methodesGlobal.nonAfficher('contenuRapport')

    //remplire la liste des année
    this.anneeOptions();

    this.titreChamp();

    //remplire la liste des plateforme
    this.creerTableauPlateforme();

    this.creerTableauFournisseurs();
  }

  //creation du select d'année a partir de 2019
  anneeOptions(){
    let anneeNow=new Date().getFullYear();
    let i=0
    while(i <=(anneeNow-2015)){
      this.arrayAnnee[i]=anneeNow-i
      i++
    }
  }
//liste des statistiques générales
async creerTableauStatistique(annees: any, plateforme: string) {
  try {
    if (!annees || annees.length === 0) {
      this.methodesGlobal.afficher('alertErreur');
      return;
    }
    
    this.methodesGlobal.nonAfficher('alertErreur');
    this.listeStatistique = [];
    this.afficherAnimation();

    const anneesStr = annees.join(', ');
    const plateformeQuery = plateforme || 'vide';
    const donneesRegroupees = new Map<string, any>();
    
    this.statistiques$ = this.statistiqueService.rapportStatistiques(annees, plateformeQuery);
    
    await this.statistiques$.toPromise().then(res => {
      const filtresEntries: [string, string][] = Object.entries(this.filtres) as [string, string][];
      
      for (const val of res) {
        const matchesFilters = filtresEntries.every(([key, elem]) => {
          const filterValue = val[key] as string;
          const filterElem = elem as string;
          return filterValue !== null && filterValue !== '' && filterElem.includes(filterValue);
        });
        
        if (!matchesFilters) continue;
        
        // Modification clé: utilisation de idRevue (val.idP) comme clé de regroupement
        const cle = val.idP;
        
        if (!donneesRegroupees.has(cle)) {
          donneesRegroupees.set(cle, {
            "Nr": donneesRegroupees.size + 1,
            "titre": val.titre,
            "idRevue": val.idP,
            "ISSN": val.ISSN,
            "EISSN": val.EISSN,
            "statut": val.statut,
            "domaine": val.domaine,
            "secteur": val.secteur,
            "abonnement": val.abonnement,
            "fournisseur": val.fournisseur,
            "annee": val.annee,
            "plateforme": val.plateforme,
            "Total_Item_Requests": parseInt(val.Total_Item_Requests) || 0,
            "Unique_Item_Requests": parseInt(val.Unique_Item_Requests) || 0,
            "No_License": parseInt(val.No_License) || 0,
            "citations": parseInt(val.citations) || 0,
            "articlesUdem": parseInt(val.articlesUdem) || 0,
            "JR4COURANT": parseInt(val.JR4COURANT) || 0,
            "JR4INTER": parseInt(val.JR4INTER) || 0,
            "JR4RETRO": parseInt(val.JR4RETRO) || 0,
            "JR3OAGOLD": parseInt(val.JR3OAGOLD) || 0,
            "dateA": '-',
            "dateM": '-',
            "bdd": val.bdd
          });
        } else {
          const existing = donneesRegroupees.get(cle);
          
          // Mise à jour des valeurs numériques
          existing.Total_Item_Requests += parseInt(val.Total_Item_Requests) || 0;
          existing.Unique_Item_Requests += parseInt(val.Unique_Item_Requests) || 0;
          existing.No_License += parseInt(val.No_License) || 0;
          existing.citations += parseInt(val.citations) || 0;
          existing.articlesUdem += parseInt(val.articlesUdem) || 0;
          existing.JR4COURANT += parseInt(val.JR4COURANT) || 0;
          existing.JR4INTER += parseInt(val.JR4INTER) || 0;
          existing.JR4RETRO += parseInt(val.JR4RETRO) || 0;
          existing.JR3OAGOLD += parseInt(val.JR3OAGOLD) || 0;
          
          // Concaténation des autres champs si nécessaire
          if (val.plateforme && !existing.plateforme.includes(val.plateforme)) {
            existing.plateforme = [existing.plateforme, val.plateforme].filter(Boolean).join(', ');
          }
          if (val.annee && !existing.annee.includes(val.annee)) {
            existing.annee = [existing.annee, val.annee].filter(Boolean).join(', ');
          }
        }
      }
      
      this.listeStatistique = Array.from(donneesRegroupees.values());
      this.initialiserDataSource();
    });
  } catch(err) {
    this.nonAfficherAnimation();
    this.methodesGlobal.afficher('alertErreur');
    console.error(`Error : ${err.message}`);
  }
}

private initialiserDataSource() {
  this.dataSource = new MatTableDataSource(this.listeStatistique);
  this.dataSource.paginator = this.paginator;
  this.dataSource.sort = this.matSort;
  this.totalDonnees = this.listeStatistique.length;
  this.nonAfficherAnimation();
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
//apliquer les filtre pour form-control
  implimentationFiltre($event: any){
    if($event.target.value!=''){
      this.filtres[$event.target.id]=$event.target.value
    }else{
      delete this.filtres[$event.target.id];
    }
  }
  //apliquer les filtre from material
  implimentationMatFiltre($event: any,id:string){
    if($event!=''){
      this.filtres[id]=$event.toString();
    }else{
      delete this.filtres[id];
    }
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
  async creerTableauPlateforme() {
    try {
      this.plateformes$ = this.plateformeService.fetchAll();
      let acronyme;
      // @ts-ignore
      await this.plateformes$.toPromise().then(res => {
        for (let i = 0; i < res.length; i++) {
          if(res[i].PlatformID){
            acronyme = res[i].PlatformID;
          } else {
            acronyme = res[i].titrePlateforme
          }
          this.listePlateforme[i]={
            "numero":i+1,
            "acronyme":acronyme,
          }
        }
      });
    } catch(err) {
      console.error(`Error : ${err.Message}`);
    }
  }
  //remplire les titre pour les case a caucher
  titreChamp(){
    this.translate.get('labels-rapport-statistique').subscribe((res: any) => {
      let result = Object.entries(res);
      for(let [key,val] of result){
        this.champsTitre[key]=val
        // @ts-ignore
        this.champs.push(key)

      }
    });
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
