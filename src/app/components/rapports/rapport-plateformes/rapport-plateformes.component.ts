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

  async creerTableauRapportPlateforme(annee: string) {
    try {
      this.rapportPlateformes$ = this.plateformeService.rapportPlateformes(annee);
      this.listeRapport = [];
      this.afficherAnimation();

      const res = await this.rapportPlateformes$.toPromise();
      const filteredRes = this.filtres.PlatformID
        ? res.filter((item: { PlatformID: any; }) => item.PlatformID === this.filtres.PlatformID)
        : res;

      this.listeRapport = filteredRes.map((item: { PlatformID: any; titrePlateforme: any; SUSHIURL: any; ConsortiumCustID: any; ConsortiumRequestorID: any; ConsortiumApiKey: any; Total_Item_Requests: any; No_License: any; citations: any; articlesUdem: any; JR3OAGOLD: any; dateA: any; dateM: any; }, index: number) => ({
        Nr: this.filtres.PlatformID ? 1 : index + 1,
        annee,
        PlatformID: item.PlatformID,
        titrePlateforme: item.titrePlateforme,
        SUSHIURL: item.SUSHIURL,
        ConsortiumCustID: item.ConsortiumCustID,
        ConsortiumRequestorID: item.ConsortiumRequestorID,
        ConsortiumApiKey: item.ConsortiumApiKey,
        Total_Item_Requests: item.Total_Item_Requests || 0,
        No_License: item.No_License || 0,
        citations: item.citations || 0,
        articlesUdem: item.articlesUdem || 0,
        JR3OAGOLD: item.JR3OAGOLD || 0,
        JR4COURANT: item.JR3OAGOLD || 0,
        JR4INTER: item.JR3OAGOLD || 0,
        JR4RETRO: item.JR3OAGOLD || 0,
        dateA: item.dateA,
        dateM: item.dateM
      }));

      // Redéfinir le contenu de la table avec la pagination et la recherche une fois que le résultat de la base de données est retourné
      this.dataSource = new MatTableDataSource(this.listeRapport);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.matSort;
      this.totalDonnees = this.listeRapport.length;
      // Afficher le tableau
      this.nonAfficherAnimation();
    } catch (err) {
      console.error(`Error: ${err.Message}`);
    }
  }

  //creation du select d'année a partir de 2019
  anneeOptions(){
    let anneeNow=new Date().getFullYear();
    let i=0
    while(i <=(anneeNow-2018)){
      this.arrayAnnee[i]=anneeNow-i
      i++
    }
  }
  //creation des th selon les case qui sont cauchée
  creationThTable($event: any): void {
    const checked = $event.target.checked;
    const value = $event.target.value;

    //si coché
    if (checked) {
      if (!this.thTableau.includes(value)) {
        this.thTableau.push(value);
      }
    } else {
      this.thTableau = this.thTableau.filter((element: any) => element !== value);
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
      for(let [key,val] of result){
        this.champsTitre[key]=val
        // @ts-ignore
        this.champs.push(key)

      }
    });
  }
}
