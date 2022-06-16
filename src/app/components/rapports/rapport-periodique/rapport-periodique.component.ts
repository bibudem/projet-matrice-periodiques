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
  // @ts-ignore
  dataSource: MatTableDataSource<ListePeriodique>;

  @ViewChild(MatPaginator) paginator: paginationPersonnalise | any;

  @ViewChild(MatSort)  matSort : MatSort | any;

  champsTitre : any = [];

  champs=[]

//variable boolean
  isLoadingResults=false

  thTableau:any=[]


  filtres:any=[]

  /*name of the excel-file which will be downloaded. */
  fileName= 'rapport-periodique.xlsx';

  totalDonnees=0


  constructor(
              private plateformeService: OutilsService,
              private periodiqueServices: PeriodiqueListeService,
              public dialog: MatDialog,
              public exporter: MatTableExporterModule,
              private translate:TranslateService) { }

  async ngOnInit() {
    //remplire la liste des plateforme
    this.creerTableauPlateforme();

    //cacher le bouton export
    this.methodesGlobal.nonAfficher('contenuRapport')

    this.titreChamp()
    //console.log(this.thTableau)

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
  //retourner un titre d'une plateforme selon son id
   chercherTitrePlateforme(id:string): string{
    let titre='';
      for(let i=0; i < this.listePlateforme.length; i++){
        if(this.listePlateforme[i]['idPlateforme']==id){
          titre+=this.listePlateforme[i]['titrePlateforme'];
        }
      }

    return titre;
  }

//liste des periodique
  async creerTableauPeriodique(plateforme: string) {
    try {
      this.listePeriodique=[]
      this.afficherAnimation()
      let j=0,k
      let result = Object.entries(this.filtres);
      this.periodiques$ = this.periodiqueServices.fetchRapportAll(plateforme);
      // @ts-ignore
      await this.periodiques$.toPromise().then(res => {
        //console.log(res)
        for (let i = 0; i < res.length; i++) {
          k=0
          for ( let [key,elem] of result){
            if(elem=== res[i][key]) {
              k++
            }
          }

          if(k==result.length){
            let plateformePrincipaleTitre = this.chercherTitrePlateforme(res[i].plateformePrincipale);

          this.listePeriodique[j]={
            "No":j+1,
            "id":res[i].idP,
            "titre":res[i].titre,
            "ISSN":res[i].ISSN,
            "EISSN":res[i].EISSN,
            "statut":res[i].statut,
            "abonnement":res[i].abonnement,
            "libreAcces":res[i].libreAcces,
            "domaine":res[i].domaine,
            "secteur":res[i].secteur,
            "sujets":res[i].sujets,
            "fonds":res[i].fonds,
            "fournisseur":res[i].fournisseur,
            "plateformePrincipale":plateformePrincipaleTitre,
            "format":res[i].format,
            "duplication":res[i].duplication,
            "duplicationCourant":res[i].duplicationCourant,
            "duplicationEmbargo1":res[i].duplicationEmbargo1,
            "duplicationEmbargo2":res[i].duplicationEmbargo2,
            "prixUtil":res[i].prixUtil,
            "dateA":res[i].dateA,
            "dateM":res[i].dateM
          }


            j++
          }
        }

        // Redéfinir le contenu de la table avec la pagination est la recherche une fois que le resultat de la bd est returné
        this.dataSource = new MatTableDataSource(this.listePeriodique);
        this.dataSource.paginator = this.paginator;
        this.totalDonnees=this.listePeriodique.length;
        this.dataSource.sort = this.matSort;
        //afficher le tableau
        this.nonAfficherAnimation()
      });
      //console.log(this.listePeriodique)
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
        XLSX.utils.book_append_sheet(wb, ws, 'Rapport-periodique-'+dateNow);

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
   console.log(this.filtres)
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






}
