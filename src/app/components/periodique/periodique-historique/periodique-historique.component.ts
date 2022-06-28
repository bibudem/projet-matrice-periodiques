import {Component, OnInit, ViewChild} from '@angular/core';
import {Observable} from "rxjs";
import {Historique} from "../../../models/Historique";
import {ActivatedRoute, Router} from "@angular/router";
import {PeriodiqueHistoriqueService} from "../../../services/periodique-historique.service";
import {tap} from "rxjs/operators";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {paginationPersonnalise} from "../../../lib/paginationPersonnalise";
import {MethodesGlobal} from "../../../lib/MethodesGlobal";
//directives pour le formulaire
import {NgForm } from '@angular/forms';
import {NgModel } from '@angular/forms';
import {TranslateService} from "@ngx-translate/core";
import {ListeChoixOptions} from "../../../lib/ListeChoixOptions";

@Component({
  selector: 'app-periodique-historique',
  templateUrl: './periodique-historique.component.html',
  styleUrls: ['./periodique-historique.component.css']
})
export class PeriodiqueHistoriqueComponent implements OnInit {
  historiques$: Observable<Historique[]> | undefined;

  //creation d'objet avec la liste des periodiques
  // @ts-ignore
  historique: Historique = {};
  id: string | null | undefined ;
  //les entêts du tableau
  displayedColumns = ['idCore','annee','core', 'secteur','modiffier','supprimer'];
  listeHistoriques: listeHistorique[] = [];
  // @ts-ignore
  dataSource: MatTableDataSource<listeHistoriques>;
  @ViewChild(MatPaginator) paginator: paginationPersonnalise | any;

  //importer les fonctions global
  methodesGlobal: MethodesGlobal = new MethodesGlobal();

  //definir le text pour les boutons
  bouttonAction='';

  titrePeriodique=localStorage.getItem('titrePeridique');
  idRevue=localStorage.getItem('idRevue');

  action='add'

  @ViewChild('closebutton') closebutton:any

  //importer les liste des choix
  listeChoixOptions: ListeChoixOptions = new ListeChoixOptions();

  constructor(private router: Router,
              private route: ActivatedRoute,
              private periodiqueHistoriqueService: PeriodiqueHistoriqueService,
              private translate: TranslateService) { }

  ngOnInit(): void {

    //afficher le bon bouton
    this.methodesGlobal.afficher('add-boutton');
    this.methodesGlobal.nonAfficher('save-boutton');
    //cacher div notification
    this.methodesGlobal.nonAfficher('alert-archive-add');

    if(this.route.snapshot.paramMap.get("id")){
      this.id=this.route.snapshot.paramMap.get("id");
    }else this.id = this.idRevue;

    this.creerTableau();
  }

  //fonction doit etre async pour attendre la reponse de la bd
  async creerTableau() {
    try {
      //recouperer le bon titre du bouton
      this.translate.get('btn-ajouter').subscribe((res: string) => {
        this.bouttonAction=res;
      });
      if (this.id != null) {
        this.historiques$ = await this.fetchAll(this.methodesGlobal.convertNumber(this.id));
        await this.historiques$.toPromise().then(res => {
          for (let i = 0; i < res.length; i++) {
            this.listeHistoriques.push(createListeHistorique(res[i].idCore,res[i].annee,res[i].core,res[i].secteur));
          }
          // Redéfinir le contenu de la table avec la pagination est la recherche une fois que le resultat de la bd est returné
          this.dataSource = new MatTableDataSource(this.listeHistoriques);
          this.dataSource.paginator = this.paginator;
          //console.log(this.dataSource);
        });
      }
    } catch(err) {
      console.error(`Error : ${err.Message}`);
      //
    }
  }

  //appliquer modifier fiche
  apliquerModifier(idArchive:number) {
    //changer l'action
    this.action='save'
    //cacher le boutton add
    this.methodesGlobal.nonAfficher('add-boutton');
    this.methodesGlobal.afficher('save-boutton');

    this.historiques$ = this.consulter(idArchive);
    this.historiques$.subscribe(res => {
      this.historique =res[0];
      //console.log(this.historique);

      //changer le texte pour le boutton
      this.translate.get('btn-enregistrer').subscribe((res: string) => {
        this.bouttonAction=res;
      });
      //remplire le formulaire

      if(this.historique){
        // @ts-ignore
        document.getElementById('idCore').value=this.historique.idCore;
        // @ts-ignore
        document.getElementById('idRevue').value=this.historique.idRevue;
        // @ts-ignore
        document.getElementById('annee').value=this.historique.annee;
        // @ts-ignore
        document.getElementById('core').value=this.historique.core;
        // @ts-ignore
        document.getElementById('secteur').value=this.historique.secteur;
      }

    });
  }

  //retour sur le profil periodique
  goBack(): void {
    //retour sur la liste des periodiques
    this.router.navigate(['/periodique/'+this.id]);
  }

  //fonction pour inserer
  post( historique:Historique): void {

    this.historiques$ = this.periodiqueHistoriqueService
      .post(historique)
      .pipe(tap(() => (this.afficherNotification('periodique/historique/'+historique.idRevue))));
  }

  update(	historique:Historique): void {
    //cacher le bouton
    this.methodesGlobal.nonAfficher('save-boutton');
    this.historiques$ = this.periodiqueHistoriqueService
      .update(historique)
      .pipe(tap(() => (this.afficherNotification('periodique/historique/'+historique.idRevue))));

  }

  delete(id: number): void {
    let textAlert:string='';
    //changer le texte pour le boutton
    this.translate.get('message.supprimer-text').subscribe((res: string) => {
      textAlert=res;
    });
    if(window.confirm(textAlert)) {
      this.historiques$ = this.periodiqueHistoriqueService
        .delete(id)
        .pipe(tap(() => (this.historiques$ = this.fetchAll(id))));
      //afficher notification
      this.methodesGlobal.afficher('alert-sup');
      let that=this;
      setTimeout(function(){
        that.methodesGlobal.nonAfficher('alert-sup');
        that.reload('periodique/historique/'+that.idRevue);
      }, 2500);
    }
  }
  //consulter fiche
  consulter(id: number) {
    console.log(id);
    return this.periodiqueHistoriqueService.consulter(id);

  }
  //recouperer la liste des periodiques
  fetchAll(idRevue: number): Observable<Historique[]> {
    return this.periodiqueHistoriqueService.fetchAll(idRevue);
  }

  //reload la page
  async reload(url: string): Promise<boolean> {
    await this.router.navigateByUrl('.', { skipLocationChange: true });
    return this.router.navigateByUrl(url);
  }

  //afficher notification ensuite recharger la page
  afficherNotification(url:string){
    //afficher la notification
    this.methodesGlobal.afficher('alert-add');
    let that=this;
    setTimeout(function(){
      that.methodesGlobal.nonAfficher('alert-add');
      that.reload(url);
    }, 1000);

  }

  //fonction pour valider
  onSubmit(f: NgForm) {
    // @ts-ignore
    let action = document.getElementById('action').value
    //recouperer les donnes pour creer l'objet

    if(f.value.idCore)
      this.historique.idCore=f.value.idCore

    if(f.value.core)
      this.historique.core=f.value.core
    else this.historique.core=''

    if(f.value.annee)
      this.historique.annee=f.value.annee
    else this.historique.annee=''

    if(f.value.secteur)
      this.historique.secteur=f.value.secteur
    else this.historique.secteur=''

    this.historique.idRevue=Number(this.id)

    //definir les champs obligatoire
    let donnesValider:any={'annee':this.historique.annee,'core':this.historique.core,'secteur':this.historique.secteur}

    switch (action){
      case 'save':
        if(this.methodesGlobal.validationDonneesForm(donnesValider)){
          this.onFermeModal()
          this.update(this.historique)
        }
        //this.remplireFiche(this.idRevue)
        break
      case 'add':
        if(this.methodesGlobal.validationDonneesForm(donnesValider)){
          this.onFermeModal()
          this.post(this.historique)
        }
        break
    }

  }
  //fermer le modal une fois envoyer les données
  onFermeModal() {
    this.closebutton.nativeElement.click();
  }

}
/** Fonction pour remplire le tableau de la liste des periodiques */

function createListeHistorique(idCoreP:number,anneeP:string,coreP:string,secteurP:string): listeHistorique {
  return {
    idCore:idCoreP,
    annee: anneeP,
    core: coreP,
    secteur: secteurP,
    modifier: '',
    supprimer: '',
  };
}
/** Class utilisée pour remplire le tableau avec la liste des périodiques**/
export interface listeHistorique {
  idCore:number;
  annee: string;
  core: string;
  secteur: string;
  modifier:string;
  supprimer:string;
}
