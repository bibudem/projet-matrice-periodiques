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
  async creerTableauStatistique(annees:any,plateforme:string) {
    try {
      // @ts-ignore
      if(annees.length==0){
        this.methodesGlobal.afficher('alertErreur')
        return;
      }
      this.methodesGlobal.nonAfficher('alertErreur')
      //vider le tableau
      this.listeStatistique=[]
      this.dataSource = new MatTableDataSource(this.listeStatistique);
      this.dataSource.paginator = this.paginator;
      this.totalDonnees=this.listeStatistique.length;
      this.afficherAnimation();

      let j=0,k,annee=''
      let result = Object.entries(this.filtres);
        for(let k=0; k<annees.length;k++) {
          annee += annees[k]
          if(k!=annees.length-1){
            annee+=", "
          }
        }
        if(!plateforme){
          plateforme='vide';
        }
        this.statistiques$ = this.statistiqueService.rapportStatistiques(annees,plateforme);
              // @ts-ignore
              await this.statistiques$.toPromise().then(res => {
                let val;
                for (let i = 0; i < res.length; i++) {
                  k=0;
                  val=res[i];
                  for ( let [key,elem] of result){
                    // @ts-ignore
                    if( res[i][key]!==null && res[i][key]!=='' && elem.includes(res[i][key])){
                      k++;
                    }
                  }
                  if(k==result.length){
                    this.listeStatistique[j]={
                      "Nr":j+1,
                      "titre":val.titre,
                      "idRevue":val.idP,
                      "ISSN":val.ISSN,
                      "EISSN":val.EISSN,
                      "statut":val.statut,
                      "domaine":val.domaine,
                      "secteur":val.secteur,
                      "abonnement":val.abonnement,
                      "fournisseur":val.fournisseur,
                      "annee":val.annee,
                      "plateforme":val.plateforme,
                      "Total_Item_Requests":val.Total_Item_Requests,
                      "Unique_Item_Requests":val.Unique_Item_Requests,
                      "No_License":val.No_License,
                      "citations":val.citations,
                      "articlesUdem":val.articlesUdem,
                      "JR4COURANT":val.JR4COURANT,
                      "JR4INTER":val.JR4INTER,
                      "JR4RETRO":val.JR4RETRO,
                      "JR3OAGOLD":val.JR3OAGOLD,
                      "dateA":'-',
                      "dateM":'-',
                      "bdd":val.bdd
                    }
                    j++
                  }
                }
            // Redéfinir le contenu de la table avec la pagination est la recherche une fois que le resultat de la bd est returné
            this.dataSource = new MatTableDataSource(this.listeStatistique);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.matSort;
            this.totalDonnees=this.listeStatistique.length;
            //afficher le tableau
            this.nonAfficherAnimation();

          });

    } catch(err) {
      this.nonAfficherAnimation()
      this.methodesGlobal.afficher('alertErreur')
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
