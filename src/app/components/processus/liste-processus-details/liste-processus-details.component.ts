import {Component, OnInit, ViewChild} from '@angular/core';
import {Observable} from "rxjs";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {paginationPersonnalise} from "../../../lib/paginationPersonnalise";
import {MatSort} from "@angular/material/sort";
import {MatDialog} from "@angular/material/dialog";
import {MethodesGlobal} from "../../../lib/MethodesGlobal";
import {ProcessusService} from "../../../services/processus.service";
import {TranslateService} from "@ngx-translate/core";
import {tap} from "rxjs/operators";
import * as XLSX from "xlsx";
import {ActivatedRoute, Router} from "@angular/router";
import {ConfirmDialogComponent} from "../../../lib/confirm-suppression-dialog.component";

@Component({
  selector: 'app-liste-processus-details',
  templateUrl: './liste-processus-details.component.html',
  styleUrls: ['./liste-processus-details.component.css']
})
export class ListeProcessusDelailsComponent implements OnInit {

  processus$: Observable<any[]> | undefined;

  codes:any=[];

  isLoading = true;

  //les entêts du tableau
  displayedColumns = ['numero','idRevue','ISSN','EISSN','titre','dateA','actions'];
  listeProcessus: any = [];
  // @ts-ignore
  dataSource: MatTableDataSource<any>;

  selectedProcessus: string | undefined;

  @ViewChild(MatPaginator) paginator: paginationPersonnalise | any;

  @ViewChild(MatSort)  matSort : MatSort | any;


  //importer les fonctions global
  methodesGlobal: MethodesGlobal = new MethodesGlobal();

  /*name of the excel-file which will be downloaded. */
  fileName= 'liste-processus.xlsx';

  routerChek :string = ''

  idProcessus: string = '';

  constructor(private processusService: ProcessusService,
              private translate: TranslateService,
              private route: ActivatedRoute,
              private router: Router,
              private dialog: MatDialog) { }

  //appliquer filtre
  applyFilter(filterValue: string) {
    const normalizedFilter = this.methodesGlobal.normalizeString(filterValue);
    // @ts-ignore
    this.dataSource.filter = normalizedFilter;
  }

  ngOnInit(): void {
    //lire l'url
    this.routerChek = this. router.url.toString();

    // @ts-ignore
    this.idProcessus = this.route.snapshot.paramMap.get("id");
    console.log(this.idProcessus);
    //prendre la fiche
    if(this.idProcessus!=null){
      this.getAllProcessusDelails(this.idProcessus);
      }
    }
  async getAllProcessusDelails(id:string) {
    try {
      let titre  ='';
      this.listeProcessus=[];
      this.processus$ = this.processusService.fetchAllDetails(id);
      // @ts-ignore
      await this.processus$.toPromise().then(res => {
        //console.log(res);
        let idVal='',issnVal='';
        for (let i = 0; i < res.length; i++) {
          idVal=res[i].idRevue;
          issnVal=res[i].ISSN;
          if(res[i].ISSN=='-1'){
            issnVal='!!!';
          }
          if(res[i].idRevue=='-1'){
            idVal='!!!';
          }
          this.listeProcessus[i]={
            "numero":i+1,
            "id_details":res[i].id_details,
            "idRevue":idVal,
            "ISSN":issnVal,
            "EISSN":res[i].EISSN,
            "titre":res[i].titre,
            "dateA":res[i].dateA
          }
        }
        // Redéfinir le contenu de la table avec la pagination est la recherche une fois que le resultat de la bd est returné
        this.dataSource = new MatTableDataSource(this.listeProcessus);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.matSort;
        this.isLoading = false;
        //console.log(this.dataSource);
      });
    } catch(err: any) {
      console.error(`Error : ${err.message}`);
    }
  }

  confirmerSuppression(id: string, titre: string): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        titre: 'Confirmation de suppression',
        message: `Êtes-vous sûr de vouloir supprimer la ligne "${titre}" ?`,
        confirmLabel: 'Supprimer',
        confirmColor: 'warn'
      }
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.deleteProcessusDetails(id);
      }
    });
  }

  async deleteProcessusDetails(id:string){
    let idP=Number(id)
    this.processus$ = this.processusService
      .deleteDetails(idP)
      .pipe(tap(() => (this.getAllProcessusDelails(this.idProcessus))));
  }

}
