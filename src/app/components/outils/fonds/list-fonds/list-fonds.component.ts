import {Component, OnInit, ViewChild} from '@angular/core';
import {Observable} from "rxjs";
import {MatPaginator} from "@angular/material/paginator";
import {MethodesGlobal} from "../../../../lib/MethodesGlobal";
import {OutilsService} from "../../../../services/outils.service";
import {TranslateService} from "@ngx-translate/core";
import {MatTableDataSource} from "@angular/material/table";
import {tap} from "rxjs/operators";
import {Router} from "@angular/router";
import {MatSort} from "@angular/material/sort";

@Component({
  selector: 'app-list-fonds',
  templateUrl: './list-fonds.component.html',
  styleUrls: ['./list-fonds.component.css']
})
export class ListFondsComponent implements OnInit {
  fonds$: Observable<any[]> | undefined;

  fond:any=[]

  //creation d'objet avec la liste des periodiques
  id: string | null | undefined ;
  //les entêts du tableau
  displayedColumns = ['numero', 'titre','description','dateM','modiffier','supprimer'];
  listeFonds: any = [];
  // @ts-ignore
  dataSource: MatTableDataSource<listeFonds>;
  @ViewChild(MatPaginator) paginator: MatPaginator | any;

  @ViewChild(MatSort)  matSort : MatSort | any;

  //importer les fonctions global
  methodesGlobal: MethodesGlobal = new MethodesGlobal();

  //definir le text pour les boutons
  bouttonAction='';


  constructor(private router: Router,
              private outilsService: OutilsService,
              private translate: TranslateService) { }

  ngOnInit(): void {
    //recouperer courriel d'admin
    this.creerListeFonds();
    //console.log( this.listeFonds)

    //afficher le bon bouton
    this.methodesGlobal.afficher('add-boutton');
    this.methodesGlobal.nonAfficher('save-boutton');
    //cacher div notification
    this.methodesGlobal.nonAfficher('alert-add');


  }

  //fonction doit etre async pour attendre la reponse de la bd
  async creerListeFonds() {
    try {

      //recouperer le bon titre du bouton
      this.translate.get('btn-ajouter').subscribe((res: string) => {
        this.bouttonAction=res;
      });
        this.fonds$ = await this.allFonds();
        await this.fonds$.toPromise().then(res => {

          for (let i = 0; i < res.length; i++) {
            this.listeFonds[i]={
              'numero':i+1,
              'idFond':res[i].idFond,
              'titre':res[i].titre,
              'description':res[i].description,
              'dateA':res[i].dateA,
              'dateM':res[i].dateM
            }
          }
         // console.log( this.listeFonds)
          // Redéfinir le contenu de la table avec la pagination est la recherche une fois que le resultat de la bd est returné
          this.dataSource = new MatTableDataSource(this.listeFonds);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.matSort;

        });
    } catch(err) {
      console.error(`Error : ${err.Message}`);
      //
    }
  }

  //appliquer modifier fiche
  async apliquerModifier(id:number) {
    //cacher le boutton add
    this.methodesGlobal.nonAfficher('add-boutton');
    this.methodesGlobal.afficher('save-boutton');

    this.fonds$ = await this.consulterFond(id);
    this.fonds$.subscribe(res => {
      this.fond=res[0]
      console.log(this.fond);

      //changer le texte pour le boutton
      this.translate.get('btn-enregistrer').subscribe((res: string) => {
        this.bouttonAction=res;
      });
      //remplire le formulaire

      if(this.fond){
        // @ts-ignore
        document.getElementById('idFond').value=this.fond.idFond;
        // @ts-ignore
        document.getElementById('titre').value=this.fond.titre;
        // @ts-ignore
        document.getElementById('description').value=this.fond.description;
      }

    });
  }

  //retour sur le profil periodique
  goBack(): void {
    //retour sur la liste des periodiques
    this.router.navigate(['/accueil']);
  }

  //fonction pour inserer
  postFond( newTitre: string,newDescription:string): void {
    if (!newTitre) return;
    this.fond= {
      newdescription: newTitre,
      newtitre: newDescription
    };

    this.fonds$ = this.outilsService
      .postFond(this.fond)
      .pipe(tap(() => (this.rechargeInterface())));

  }

  update( idFond:number,newTitre: string,newDescription:string): void {

    if (!newTitre) return;
    this.fond= {
      idFond:idFond,
      newdescription: newTitre,
      newtitre: newDescription
    };
    this.methodesGlobal.afficher('add-boutton');
    //cacher le bouton
    this.methodesGlobal.nonAfficher('save-boutton');

    this.fonds$ = this.outilsService
      .updateFond(this.fond)
      .pipe(tap(() => (this.rechargeInterface())));


  }

  deleteFond(id: number): void {
    let textAlert:string='';
    //changer le texte pour le boutton
    this.translate.get('message.supprimer-text').subscribe((res: string) => {
      textAlert=res;
    });
    if(window.confirm(textAlert)) {
      this.fonds$ = this.outilsService
        .deleteFond(id)
        .pipe(tap(() => (this.rechargeInterface())));
      //afficher notification
      this.methodesGlobal.afficher('alert-sup-note');
      let that=this;
      setTimeout(function(){
        that.methodesGlobal.nonAfficher('alert-sup-note');
      }, 1500);
    }
  }

  //consulter fiche
  consulterFond(id: number) {
    //console.log(id);
    return this.outilsService.consulterFond(id);

  }
  //recouperer la liste des periodiques
  allFonds(): Observable<any[]> {
    return this.outilsService.allFonds();
  }
  //recharge page
  rechargeInterface(){
    this.listeFonds=[];
    //afficher la notification
    this.methodesGlobal.afficher('alert-add-note');
    //recharger le tableau des données
    this.creerListeFonds();
    //videz les champs
    // @ts-ignore
    document.getElementById('idFond').value='';
    // @ts-ignore
    document.getElementById('titre').value='';
    // @ts-ignore
    document.getElementById('description').value='';
    //cacher bouton save
    this.methodesGlobal.nonAfficher('save-boutton');
    let that=this;
    setTimeout(function(){
      that.methodesGlobal.nonAfficher('alert-add');
    }, 2000);
  }


}
