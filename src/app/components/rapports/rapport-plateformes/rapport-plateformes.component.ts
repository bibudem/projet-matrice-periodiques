import {Component, OnInit, ViewChild} from '@angular/core';
import {MethodesGlobal} from "../../../lib/MethodesGlobal";
import {ListeChoixOptions} from "../../../lib/ListeChoixOptions";
import {Observable} from "rxjs";
import {MatTableDataSource} from "@angular/material/table";
import {ListePeriodique} from "../../periodique/periodique-liste/periodique-liste.component";
import {MatPaginator} from "@angular/material/paginator";
import {paginationPersonnalise} from "../../../lib/paginationPersonnalise";
import {MatSort} from "@angular/material/sort";
import {OutilsService} from "../../../services/outils.service";
import {PeriodiqueListeService} from "../../../services/periodique-liste.service";
import {MatDialog} from "@angular/material/dialog";
import {MatTableExporterModule} from "mat-table-exporter";
import {TranslateService} from "@ngx-translate/core";
import * as XLSX from "xlsx";

@Component({
  selector: 'app-rapport-plateformes',
  templateUrl: './rapport-plateformes.component.html',
  styleUrls: ['./rapport-plateformes.component.css']
})
export class RapportPlateformesComponent implements OnInit {
//importer les fonctions global
  methodesGlobal: MethodesGlobal = new MethodesGlobal();

  //importer les liste des choix
  listeChoixOptions: ListeChoixOptions = new ListeChoixOptions();

  //creer la liste des plateforme
  plateformes$: Observable<any> | undefined;
  listePlateforme: any = [];

  //creer la liste des plateforme
  rapportPlateformes$: Observable<any> | undefined;
  listeRapport: any = [];

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
  fileName= 'rapport-plateformes.xlsx';

  totalDonnees=0

  //Initialiser le tableau d'annee'
  arrayAnnee:any[]=[];
  constructor(private plateformeService: OutilsService,
              public exporter: MatTableExporterModule,
              private translate:TranslateService) { }

  async ngOnInit() {
    //remplire la liste des plateforme
    this.creerTableauPlateforme();

    //cacher le bouton export
    this.methodesGlobal.nonAfficher('contenuRapport')

    this.titreChamp()
    //remplire la liste des année
    this.anneeOptions();

  }


  async creerTableauPlateforme() {
    try {
      this.plateformes$ = this.plateformeService.fetchAll();
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

  async creerTableauRapportPlateforme(annee:string,ordre:string) {
    try {
      this.rapportPlateformes$ = this.plateformeService.rapportPlateformes(annee);
      this.listeRapport=[]
      this.afficherAnimation()

      // @ts-ignore
      await this.rapportPlateformes$.toPromise().then(res => {
        console.log(res)
        console.log(this.filtres)
        for (let i = 0; i < res.length; i++) {
          if(!res[i].total_tel)res[i].total_tel=0
          if(!res[i].unique_tel)res[i].unique_tel=0
          if(!res[i].refus)res[i].refus=0

          if(this.filtres.PlatformID){
              if(this.filtres.PlatformID==res[i].acronyme){
                this.listeRapport[0]={
                  "Nr":1,
                  "annee":annee,
                  "PlatformID":res[i].acronyme,
                  "titrePlateforme":res[i].titrePlateforme,
                  "SUSHIURL":res[i].SUSHIURL,
                  "ConsortiumCustID":res[i].ConsortiumCustID,
                  "ConsortiumRequestorID":res[i].ConsortiumRequestorID,
                  "ConsortiumApiKey":res[i].ConsortiumApiKey,
                  "total_tel":res[i].total_tel,
                  "unique_tel":res[i].unique_tel,
                  "refus":res[i].refus,
                  "dateA":res[i].dateA,
                  "dateM":res[i].dateM
                }
              }
          }else {
            this.listeRapport[i]={
              "Nr":i+1,
              "annee":annee,
              "PlatformID":res[i].acronyme,
              "titrePlateforme":res[i].titrePlateforme,
              "SUSHIURL":res[i].SUSHIURL,
              "ConsortiumCustID":res[i].ConsortiumCustID,
              "ConsortiumRequestorID":res[i].ConsortiumRequestorID,
              "ConsortiumApiKey":res[i].ConsortiumApiKey,
              "total_tel":res[i].total_tel,
              "unique_tel":res[i].unique_tel,
              "refus":res[i].refus,
              "dateA":res[i].dateA,
              "dateM":res[i].dateM
            }
          }
        }
        //mettre l'ordre s'il existe
        if(ordre!=''){
          this.ordonerArray(this.listeRapport,ordre)
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
  //creation du select d'année a partir de 2019
  anneeOptions(){
    let anneeNow=new Date().getFullYear();
    let i=0
    while(i <=(anneeNow-2019)){
      this.arrayAnnee[i]=anneeNow-i
      i++
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
      XLSX.utils.book_append_sheet(wb, ws, 'Rapport-plateformes-'+dateNow);

      /* save to file */
      XLSX.writeFile(wb, that.fileName);
    }, 1500);

    //console.log(this.dataSource);

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
    this.translate.get('labels-rapport-plateforme').subscribe((res: any) => {
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
  //appliquer le sort ASC
  ordonerArray(array:any,keySort:string){
    // @ts-ignore
    return array.sort((a, b) => {
      let x = Number(a[keySort]);
      let y = Number(b[keySort]);
      //console.log(keySort)
      return ((x >y ) ? -1 : ((x <  y) ? 1 : 0));
    });
  }
}
