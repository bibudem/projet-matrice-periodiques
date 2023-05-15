import {Component, OnInit, ViewChild} from '@angular/core';
import {Observable} from "rxjs";
import {MatPaginator} from "@angular/material/paginator";
import {MethodesGlobal} from "../../../lib/MethodesGlobal";
import {OutilsService} from "../../../services/outils.service";
import {TranslateService} from "@ngx-translate/core";
import {MatTableDataSource} from "@angular/material/table";
import {tap} from "rxjs/operators";
import {Router} from "@angular/router";
import {MatSort} from "@angular/material/sort";

@Component({
  selector: 'app-list-fournisseurs',
  templateUrl: './list-fournisseurs.component.html',
  styleUrls: ['./list-fournisseurs.component.css']
})
export class ListFournisseursComponent implements OnInit {
  fournisseurs$: Observable<any[]> | undefined;

  fournisseur:any=[]

  //creation d'objet avec la liste des periodiques
  id: string | null | undefined ;
  //les entêts du tableau
  displayedColumns = ['numero', 'titre','dateA','dateM','modiffier','supprimer'];
  listeFournisseurs: any = [];
  // @ts-ignore
  dataSource: MatTableDataSource<listeFournisseurs>;

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
    this.creerListeFournisseurs();
    //console.log( this.listeFonds)
    //afficher le bon bouton
    this.methodesGlobal.afficher('add-boutton');
    this.methodesGlobal.nonAfficher('save-boutton');
    //cacher div notification
    this.methodesGlobal.nonAfficher('alert-add');
  }

  //fonction doit etre async pour attendre la reponse de la bd
  async creerListeFournisseurs() {
    try {

      //recouperer le bon titre du bouton
      this.translate.get('btn-ajouter').subscribe((res: string) => {
        this.bouttonAction=res;
      });
        this.fournisseurs$ = await this.allFournisseurs();
        await this.fournisseurs$.toPromise().then(res => {
          for (let i = 0; i < res.length; i++) {
            this.fournisseur[i]={
              'numero':i+1,
              'idFournisseurs':res[i].idFournisseurs,
              'titre':res[i].titre,
              'description':res[i].description,
              'dateA':res[i].dateA,
              'dateM':res[i].dateM
            }
          }
          //console.log( this.fournisseur)
          // Redéfinir le contenu de la table avec la pagination est la recherche une fois que le resultat de la bd est returné
          this.dataSource = new MatTableDataSource(this.fournisseur);
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

    this.fournisseurs$ = await this.consulterFournisseur(id);
    if(this.fournisseurs$!==undefined){
        this.fournisseurs$.subscribe(res => {
            this.fournisseur=res[0]
            //console.log(this.fournisseur);
            //changer le texte pour le boutton
            this.translate.get('btn-enregistrer').subscribe((res: string) => {
              this.bouttonAction=res;
            });

          //remplire le formulaire
          if(this.fournisseur){
            // @ts-ignore
            document.getElementById('idFournisseurs').value=this.fournisseur.idFournisseurs;
            // @ts-ignore
            document.getElementById('titre').value=this.fournisseur.titre;
            // @ts-ignore
            document.getElementById('description').value=this.fournisseur.description;
          }

        });
    }
  }

  //retour sur le profil periodique
  goBack(): void {
    //retour sur la liste des periodiques
    this.router.navigate(['/accueil']);
  }

  //fonction pour inserer
  postFournisseurs(newTitre: string,newDescription:string): void {
    this.methodesGlobal.nonAfficher('save-boutton');
    if (!newTitre) return;
    this.fournisseur= {
      titre: newTitre,
      description: newDescription
    };
    this.fournisseurs$ = this.outilsService
      .postFournisseur(this.fournisseur)
      .pipe(tap(() => (this.rechargeInterface())));
  }

  update(idFournisseurs:number,newTitre: string,newDescription:string): void {
    this.methodesGlobal.nonAfficher('add-boutton');
    if (!newTitre) return;
    this.fournisseur= {
      idFournisseurs:idFournisseurs,
      titre: newTitre,
      description: newDescription
    };
    this.methodesGlobal.afficher('add-boutton');
    //cacher le bouton
    this.methodesGlobal.nonAfficher('save-boutton');

    this.fournisseurs$ = this.outilsService
      .updateFournisseur(this.fournisseur)
      .pipe(tap(() => (this.rechargeInterface())));
  }

  deleteFournisseur(id: number): void {
    let textAlert:string='';
    //changer le texte pour le boutton
    this.translate.get('message.supprimer-text').subscribe((res: string) => {
      textAlert=res;
    });
    if(window.confirm(textAlert)) {
      this.fournisseurs$ = this.outilsService
        .deleteFournisseur(id)
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
  consulterFournisseur(id: number) {
    this.methodesGlobal.nonAfficher('add-boutton');
    return this.outilsService.consulterFournisseur(id);
  }
  //recouperer la liste des periodiques
  allFournisseurs(): Observable<any[]> {
    return this.outilsService.allFournisseurs();
  }
  //recharge page
  rechargeInterface(){
    let that=this;
    setTimeout(function(){
      that.methodesGlobal.nonAfficher('alert-add');
    }, 2000);
    this.reload('/list-fournisseurs');
  }
  async reload(url: string): Promise<boolean> {
    await this.router.navigateByUrl('.', { skipLocationChange: true });
    return this.router.navigateByUrl(url);
  }

}
