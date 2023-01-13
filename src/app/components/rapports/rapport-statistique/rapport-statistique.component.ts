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
  isLoadingResults=false

  thTableau:any=[]


  filtres:any=[]

  /*name of the excel-file which will be downloaded. */
  fileName= 'rapport-logs-revues.xlsx';

  totalDonnees=0

  //creer la liste des plateforme
  plateformes$: Observable<any> | undefined;
  listePlateforme: any = [];

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
  async creerTableauStatistique(annees:any,type:string,plateforme:string) {
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

      let j=0,k,tele_moyenne,unique_moyenne,refus_moyenn,citation_moyenn,articlesUdem_moyenn,annee=''
      let resultFiltre = Object.entries(this.filtres);
        for(let k=0; k<annees.length;k++) {
          annee += annees[k]
          if(k!=annees.length-1){
            annee+=", "
          }
        }
        if(type=='plateforme'){
          this.statistiques$ = this.statistiqueService.rapportStatistiquesPlateforme(annees,plateforme);
        } else this.statistiques$ = this.statistiqueService.rapportStatistiques(annees,plateforme);

              // @ts-ignore
              await this.statistiques$.toPromise().then(res => {
                //console.log(res)
                for (let val of res) {
                  k=0
                  for ( let [key,elem] of resultFiltre){
                    //console.log(key);
                    if(elem== val[key]) {
                      k++
                    }
                  }

                  if(k==resultFiltre.length){
                    if(type=='plateforme'){
                      tele_moyenne='-'
                      unique_moyenne='-'
                      refus_moyenn='-'
                      citation_moyenn='-'
                      articlesUdem_moyenn='-'
                    }else {
                    //chercher les donnees statistiques
                    tele_moyenne=parseFloat((val.Total_Item_Requests/annees.length).toFixed(2))
                    unique_moyenne=parseFloat((val.Unique_Item_Requests/annees.length).toFixed(2))
                    refus_moyenn=parseFloat((val.No_License/annees.length).toFixed(2))
                    citation_moyenn=parseFloat((val.citations/annees.length).toFixed(2))
                    articlesUdem_moyenn=parseFloat((val.articlesUdem/annees.length).toFixed(2))
                    }

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
                      "annee":annee,
                      "plateforme":val.plateforme,
                      "Total_Item_Requests":val.Total_Item_Requests,
                      "Unique_Item_Requests":val.Unique_Item_Requests,
                      "No_License":val.No_License,
                      "citations":val.citations,
                      "articlesUdem":val.articlesUdem,
                      "JR5COURANT":val.JR5COURANT,
                      "JR5INTER":val.JR5INTER,
                      "JR5RETRO":val.JR5RETRO,
                      "JR3OAGOLD":val.JR3OAGOLD,
                      "tele_moyenne":tele_moyenne,
                      "unique_moyenne":unique_moyenne,
                      "refus_moyenn":refus_moyenn,
                      "citation_moyenn":citation_moyenn,
                      "articlesUdem_moyenn":articlesUdem_moyenn,
                      "dateA":'-',
                      "dateM":'-',
                      "bdd":val.bdd
                    }
                    j++
                  }
                }
            // Redéfinir le contenu de la table avec la pagination est la recherche une fois que le resultat de la bd est returné
                // console.log(this.listeStatistique)
            this.dataSource = new MatTableDataSource(this.listeStatistique);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.matSort;
            this.totalDonnees=this.listeStatistique.length;
            //afficher le tableau
            this.nonAfficherAnimation();

          });

      //console.log(this.listeStatistique)
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

  //exporter les données en format xlsx
  async ExportTOExcel()
  {
    let that=this
    that.afficherAnimation()
    this.isLoadingResults=true
    setTimeout(async function () {
      that.nonAfficherAnimation()
      let dateNow=new Date().getUTCDate();
      /* table id is passed over here */
      let element = document.getElementById('table-rapport');
      const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);

      /* generate workbook and add the worksheet */
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Rapport-statistique-'+dateNow);

      /* save to file */
      XLSX.writeFile(wb, that.fileName);
    }, 3000);

    //console.log(this.dataSource);

  }
//apliquer les filtre pour le rapport
  implimentationFiltre($event: any){
    if($event.target.value!=''){
      this.filtres[$event.target.id]=$event.target.value
    }else{
      delete this.filtres[$event.target.id];
    }
    // console.log(this.filtres)
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
      // console.log(typeof(result))
      for(let [key,val] of result){
        this.champsTitre[key]=val
        // @ts-ignore
        this.champs.push(key)

      }
    });
  }
}
