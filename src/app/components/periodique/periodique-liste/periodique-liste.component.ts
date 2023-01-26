import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import { Observable } from "rxjs";
import { Periodique } from "src/app/models/Periodique";
import {PeriodiqueListeService} from "../../../services/periodique-liste.service";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import { MatPaginator } from '@angular/material/paginator';
import { paginationPersonnalise } from '../../../lib/paginationPersonnalise';
import {MethodesGlobal} from "../../../lib/MethodesGlobal";



@Component({
  selector: 'app-periodique-liste',
  templateUrl: './periodique-liste.component.html',
  styleUrls: ['./periodique-liste.component.css']
})
export class PeriodiqueListeComponent implements OnInit{
 //les entêts du tableau
  displayedColumns = ['idRevue', 'titre', 'ISSN', 'EISSN','secteur','domaine','abonnement','bdd','statut','dateA','dateM','consulter'];
  listePeriodiques: ListePeriodique[] = [];
  // @ts-ignore
  dataSource: MatTableDataSource<ListePeriodique>;

  @ViewChild(MatPaginator) paginator: paginationPersonnalise | any;

  @ViewChild(MatSort)  matSort : MatSort | any;


  //importer les fonctions global
  methodesGlobal: MethodesGlobal = new MethodesGlobal();

  periodiques$: Observable<any[]> | undefined;

  //prendre la valeur d'un input
  getValue(value:string){
    return value.trim();
  }

  //garder les titre rechercher dans les filtres
  textRechercher=''

  ifAdmin=false;

  constructor(private periodiqueListeService: PeriodiqueListeService ) {

  }
//appliquer filtre
  applyFilter(filterValue: string) {
    localStorage.setItem('textFiltre','')
    this.textRechercher=this.historiqueRechercheZone()
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    // @ts-ignore
    this.dataSource.filter = filterValue;

  }


  ngOnInit():void {
    //creation du tableau
    this.creerTableau();

    this.textRechercher=this.historiqueRechercheZone()
    //ajout de niveau de securité
    this.ifAdmin=this.methodesGlobal.ifAdminFunction()

  }


  //fonction doit etre async pour attendre la reponse de la bd
  async creerTableau() {
    try {
      this.periodiques$ = await this.fetchAll();
      await this.periodiques$.toPromise().then(res => {
        for (let i = 0; i < res.length; i++) {
          this.listePeriodiques.push(createListePeriodique(res[i].idRevue,res[i].titre,res[i].ISSN,res[i].EISSN,res[i].secteur,res[i].domaine,res[i].abonnement,res[i].bdd,res[i].statut,res[i].dateA,res[i].dateM));
        }
        // Redéfinir le contenu de la table avec la pagination est la recherche une fois que le resultat de la bd est returné
        this.dataSource = new MatTableDataSource(this.listePeriodiques);
        if (this.textRechercher != '') {
          this.applyFilter(this.textRechercher)
        }
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.matSort;

      });
    } catch(err) {
      console.error(`Error : ${err.Message}`);
      //
    }
  }

//recouperer la liste des periodiques
  fetchAll(): Observable<Periodique[]> {
    return this.periodiqueListeService.fetchAll();
  }

  //garder les key pour le filtre de recherche
  historiqueRechercheZone(){
    let result=''
    // @ts-ignore
    let textFiltre=document.getElementById('textFiltre').value
    if(textFiltre!='')
       localStorage.setItem('textFiltre',textFiltre)

    if(localStorage.getItem('textFiltre'))
      { // @ts-ignore
        result=localStorage.getItem('textFiltre')
      }

    return result
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

}
//fonctions pour ordoner les colons

/** Fonction pour remplire le tableau de la liste des periodiques */

function createListePeriodique(idRevueP: number,titreP:string,ISSNP:string,EISSNP:string,secteurP:string,domaineP:string,abonnementP:string,bddP:string,statutP:string,dateAP:string,dateMP:string): ListePeriodique {
  return {
    idRevue: idRevueP.toString(),
    titre: titreP,
    ISSN: ISSNP,
    EISSN: EISSNP,
    secteur: secteurP,
    domaine: domaineP,
    abonnement: abonnementP,
    bdd: bddP,
    statut: statutP,
    dateA: dateAP,
    dateM: dateMP,
    consulter: '',
  };
}
/** Class utilisée pour remplire le tableau avec la liste des périodiques**/
export interface ListePeriodique {
  idRevue: string;
  titre: string;
  ISSN: string;
  EISSN: string;
  secteur: string;
  domaine: string;
  abonnement: string;
  bdd: string;
  statut: string;
  dateA: string;
  dateM: string;
  consulter:string;
}
