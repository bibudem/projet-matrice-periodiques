import {Component, OnInit, ViewChild} from '@angular/core';
import {Observable} from "rxjs";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {paginationPersonnalise} from "../../lib/paginationPersonnalise";
import {MethodesGlobal} from "../../lib/MethodesGlobal";
import {ListeStatistique} from "../../models/ListeStatistique";
import {TranslateService} from "@ngx-translate/core";
import {ListeStatistiquesService} from "../../services/liste-statistiques.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MatSort} from "@angular/material/sort";
import * as XLSX from "xlsx";

@Component({
  selector: 'app-statistique-liste',
  templateUrl: './statistique-liste.component.html',
  styleUrls: ['./statistique-liste.component.css']
})
export class StatistiqueListeComponent implements OnInit {
  listeStatistique$: Observable<any[]> | undefined;

  //creation d'objet avec la liste des periodiques
  // @ts-ignore
  public listeStatistique: ListeStatistique = {};
  id: string | null | undefined ;
  //les entêts du tableau
  displayedColumns = ['numero','annee','plateforme', 'titre','telech','refus','citation','articlesUdem','dateA','consulter'];
  tableauStatistique: any = [];

  //Initialiser le tableau d'annee'
  arrayAnnee:any[]=[];
  // @ts-ignore
  dataSource: MatTableDataSource<ListeStatistique>;

  anneeStatistique: string | null =  '' ;

  @ViewChild(MatPaginator) paginator: paginationPersonnalise | any;

  @ViewChild(MatSort)  matSort : MatSort | any;

  //importer les fonctions global
  methodesGlobal: MethodesGlobal = new MethodesGlobal();

  annee = new Date().getFullYear()-1;

  ifAdmin=false;

  /*name of the excel-file which will be downloaded. */
  fileName= 'rapport-statistiques-liste.xlsx';

  constructor(private listeStatistiqueService: ListeStatistiquesService,
              private translate: TranslateService,
              private router: Router,
              private route: ActivatedRoute,) { }

  //appliquer filtre
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    // @ts-ignore
    this.dataSource.filter = filterValue;
  }

  ngOnInit(): void {
    //remplire la liste des annees
    this.anneeOptions()

    //ajout de niveau de securité
    this.ifAdmin=this.methodesGlobal.ifAdminFunction();
    // recouperer l'annee par url
    if(this.route.snapshot.paramMap.get("annee")){
      this.anneeStatistique = this.route.snapshot.paramMap.get("annee");
      this.creerTableau(String(this.anneeStatistique));
    }else{
      this.creerTableau(String(this.annee));
    }


  }
  //fonction doit etre async pour attendre la reponse de la bd
  async creerTableau(annee:string) {
    try {
      this.tableauStatistique=[]
      this.listeStatistique$ = await this.fetchAll(annee);
      await this.listeStatistique$.toPromise().then(res => {
        // console.log(res[0])
        let i=0
        for (let val of res[0]) {
          if(!val.citations)val.citations=0
          if(!val.articlesUdem)val.articlesUdem=0
          if(!val.Total_Item_Requests)val.Total_Item_Requests=0
          if(!val.Unique_Item_Requests)val.Unique_Item_Requests=0
          if(!val.No_License)val.No_License=0
          this.tableauStatistique[i]={
            "numero":i+1,
            "idRevue":val.idP,
            "annee":val.annee,
            "idStatistique":val.idStatistique,
            "plateforme":val.plateforme,
            "titre":val.titreP,
            "telech":val.Total_Item_Requests,
            "refus":val.No_License,
            "citation":val.citations,
            "articlesUdem":val.articlesUdem,
            "dateA":val.date
          }
          i++
        }
        // Redéfinir le contenu de la table avec la pagination est la recherche une fois que le resultat de la bd est returné
        this.dataSource = new MatTableDataSource(this.tableauStatistique);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.matSort;
        //console.log(this.tableauStatistique);
      });
    } catch(err) {
      console.error(`Error : ${err.Message}`);
      //
    }
  }

  //recouperer la liste des periodiques
  fetchAll(annee:string): Observable<ListeStatistique[]> {
    return this.listeStatistiqueService.fetchAll(annee);
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

  //redirectioner vers les détails de statistiques
  consulterStatistique(id:string,titre:string){
    localStorage.setItem('titrePeridique',titre);
    this.router.navigate(['/periodique/statistiques/'+id+'/historique']);
  }
    //vider le filtre
  viderFiltre(){
    // @ts-ignore
    if(document.getElementById('textFiltre').value){
      // @ts-ignore
      document.getElementById('textFiltre').value=''
      localStorage.setItem('textFiltre','')
      this.applyFilter('')
    }

  }
  //exporter les données en format xlsx
  async ExportTOExcel()
  {
    let that=this

    setTimeout(async function () {
      let dateNow=new Date().getUTCDate();
      /* table id is passed over here */
      let element = document.getElementById('table-rapport-statistiques-liste');
      const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);

      /* generate workbook and add the worksheet */
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Rapport-logs-revues-'+dateNow);

      /* save to file */
      XLSX.writeFile(wb, that.fileName);
    }, 3000);

    //console.log(this.dataSource);

  }
}
