import {Component, OnInit, ViewChild} from '@angular/core';
import {Observable} from "rxjs";
import {Prix} from "../../../models/Prix";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {paginationPersonnalise} from "../../../lib/paginationPersonnalise";
import {MethodesGlobal} from "../../../lib/MethodesGlobal";
import {ActivatedRoute, Router} from "@angular/router";
import {PeriodiquePrixService} from "../../../services/periodique-prix.service";
import {TranslateService} from "@ngx-translate/core";
import {tap} from "rxjs/operators";
import {NgForm} from "@angular/forms";

@Component({
  selector: 'app-periodique-prix',
  templateUrl: './periodique-prix.component.html',
  styleUrls: ['./periodique-prix.component.css']
})
export class PeriodiquePrixComponent implements OnInit {
  prix$: Observable<Prix[]> | undefined;

  //creation d'objet avec la liste des periodiques
  // @ts-ignore
  prixObj: any = {};
  id: string | null | undefined ;
  //les entêts du tableau
  displayedColumns = ['nrPrix','annee', 'prix','modiffier','supprimer'];
  listePrix: any[] = [];
  // @ts-ignore
  dataSource: MatTableDataSource<listePrix>;
  @ViewChild(MatPaginator) paginator: paginationPersonnalise | any;

  //importer les fonctions global
  methodesGlobal: MethodesGlobal = new MethodesGlobal();

  //definir le text pour les boutons
  bouttonAction='';

  titrePeriodique=localStorage.getItem('titrePeridique');
  idRevue=localStorage.getItem('idRevue');

  action='add'

  @ViewChild('closebutton') closebutton:any

  constructor(private router: Router,
              private route: ActivatedRoute,
              private periodiquePrixService: PeriodiquePrixService,
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
        this.prix$ = await this.fetchAll(this.methodesGlobal.convertNumber(this.id));
        await this.prix$.toPromise().then(res => {
          for (let i = 0; i < res.length; i++) {
            this.listePrix.push(createListePrix(i,res[i].idPrix,res[i].annee,res[i].prix,res[i].note));
          }
          // Redéfinir le contenu de la table avec la pagination est la recherche une fois que le resultat de la bd est returné
          this.dataSource = new MatTableDataSource(this.listePrix);
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
  apliquerModifier(idPrix:number) {
    //cacher le boutton add
    this.methodesGlobal.nonAfficher('add-boutton');
    this.methodesGlobal.afficher('save-boutton');
    //changer l'action
    this.action='save'
    console.log(this.listePrix[idPrix]);
    this.prixObj =this.listePrix[idPrix];
    //changer le texte pour le boutton
    this.translate.get('btn-enregistrer').subscribe((res: string) => {
      this.bouttonAction=res;
    });
   /* this.prix$ = this.consulter(idPrix);
    this.prix$.subscribe(res => {
      this.prixObj =res[0];
      //console.log(this.prixObj);

      //changer le texte pour le boutton
      this.translate.get('btn-enregistrer').subscribe((res: string) => {
        this.bouttonAction=res;
      });
    });*/
  }

  //retour sur le profil periodique
  goBack(): void {
    //retour sur la liste des periodiques
    this.router.navigate(['/periodique/'+this.id]);
  }

  //fonction pour inserer
  post( prix:Prix): void {
    this.prix$ = this.periodiquePrixService
      .post(prix)
      .pipe(tap(() => (this.afficherNotification('periodique/prix/'+prix.idRevue))));
  }

  update(	prix:Prix): void {
    //cacher le bouton
    this.methodesGlobal.nonAfficher('save-boutton');

    this.prix$ = this.periodiquePrixService
      .update(prix)
      .pipe(tap(() => (this.afficherNotification('periodique/prix/'+prix.idRevue))));

  }

  delete(id: number): void {
    let textAlert:string='';
    //changer le texte pour le boutton
    this.translate.get('message.supprimer-text').subscribe((res: string) => {
      textAlert=res;
    });
    if(window.confirm(textAlert)) {
      this.prix$ = this.periodiquePrixService
        .delete(id)
        .pipe(tap(() => (this.prix$ = this.fetchAll(id))));
      //afficher notification
      this.methodesGlobal.afficher('alert-sup');
      let that=this;
      setTimeout(function(){
        that.methodesGlobal.nonAfficher('alert-sup');
        that.reload('periodique/prix/'+that.idRevue);
      }, 2500);
    }
  }
  //consulter fiche
  consulter(id: number) {
    //console.log(id);
    return this.periodiquePrixService.consulter(id);

  }
  //recouperer la liste des periodiques
  fetchAll(idRevue: number): Observable<Prix[]> {
    return this.periodiquePrixService.fetchAll(idRevue);
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
    if(f.value.idPrix)
      this.prixObj.idPrix=f.value.idPrix

    if(f.value.annee)
      this.prixObj.annee=f.value.annee
    else this.prixObj.annee=''

    if(f.value.prix)
      this.prixObj.prix=f.value.prix
    else this.prixObj.prix=''

    if(f.value.note)
      this.prixObj.note=f.value.note
    else this.prixObj.note=''


    this.prixObj.idRevue=Number(this.id)

    //definir les champs obligatoire
    let donnesValider:any={'annee':this.prixObj.annee,'prix':this.prixObj.prix}

    switch (action){
      case 'save':
        if(this.methodesGlobal.validationDonneesForm(donnesValider)){
          this.onFermeModal()
          this.update(this.prixObj)
        }
        //this.remplireFiche(this.idRevue)
        break
      case 'add':
        if(this.methodesGlobal.validationDonneesForm(donnesValider)){
          this.onFermeModal()
          this.post(this.prixObj)
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

function createListePrix(nrP:number,idPrixP:number,newAnnee: string,newPrix: string,newNote: string): listePrix {
  return {
    nrPrix:nrP,
    idPrix:idPrixP,
    annee: newAnnee,
    prix: newPrix,
    note: newNote,
    modifier: '',
    supprimer: '',
  };
}
/** Class utilisée pour remplire le tableau avec la liste des périodiques**/
export interface listePrix {
  nrPrix:number;
  idPrix:number;
  annee: string;
  prix: string;
  note: string;
  modifier:string;
  supprimer:string;
}
