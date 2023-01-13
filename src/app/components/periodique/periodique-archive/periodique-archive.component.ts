import {Component, OnInit, ViewChild} from '@angular/core';
import {Observable} from "rxjs";
import {Archive} from "../../../models/Archive";
import {ActivatedRoute, Router} from "@angular/router";
import {PeriodiqueArchiveService} from "../../../services/periodique-archive.service";
import {tap} from "rxjs/operators";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {paginationPersonnalise} from "../../../lib/paginationPersonnalise";
import {MethodesGlobal} from "../../../lib/MethodesGlobal";
//directives pour le formulaire
import {NgForm } from '@angular/forms';
import {NgModel } from '@angular/forms';
import {TranslateService} from "@ngx-translate/core";


@Component({
  selector: 'app-periodique-archive',
  templateUrl: './periodique-archive.component.html',
  styleUrls: ['./periodique-archive.component.css']
})

export class PeriodiqueArchiveComponent implements OnInit {
  archives$: Observable<Archive[]> | undefined;

  //creation d'objet avec la liste des periodiques
  // @ts-ignore
  archive: Archive = {};
  id: string | null | undefined ;
  //les entêts du tableau
  displayedColumns = ['idArchive','perennite', 'conserverPap', 'anneeDebut', 'anneeFin','volDebut','volFin','embargo','fournisseur','modiffier','supprimer'];
  listeArchives: ListeArchive[] = [];
  // @ts-ignore
  dataSource: MatTableDataSource<ListeArchive>;
  @ViewChild(MatPaginator) paginator: paginationPersonnalise | any;

  //importer les fonctions global
  methodesGlobal: MethodesGlobal = new MethodesGlobal();

  //definir le text pour les boutons
  bouttonAction='';

  titrePeriodique=localStorage.getItem('titrePeridique');
  idRevue=localStorage.getItem('idRevue');

  action='add'

  @ViewChild('closebutton') closebutton:any

  constructor( private router: Router,
               private route: ActivatedRoute,
               private periodiqueArchiveService: PeriodiqueArchiveService,
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
        this.archives$ = await this.fetchAll(this.methodesGlobal.convertNumber(this.id));
        await this.archives$.toPromise().then(res => {
          for (let i = 0; i < res.length; i++) {
            this.listeArchives.push(createListeArchive(res[i].idArchive,res[i].perennite,res[i].conserverPap,res[i].anneeDebut,res[i].anneeFin,res[i].volDebut,res[i].volFin,res[i].embargo,res[i].fournisseur));
          }
          // Redéfinir le contenu de la table avec la pagination est la recherche une fois que le resultat de la bd est returné
          this.dataSource = new MatTableDataSource(this.listeArchives);
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
    //cacher le boutton add
    this.methodesGlobal.nonAfficher('add-boutton');
    this.methodesGlobal.afficher('save-boutton');
    //changer l'action
    this.action='save'

    this.archives$ = this.consulter(idArchive);
    this.archives$.subscribe(res => {
      this.archive =res[0];
      //console.log(this.archive);

      //changer le texte pour le boutton
      this.translate.get('btn-enregistrer').subscribe((res: string) => {
        this.bouttonAction=res;
      });
      //remplire le formulaire

      if(this.archive){
        // @ts-ignore
        document.getElementById('perennite').value=this.archive.perennite;
        // @ts-ignore
        document.getElementById('idArchive').value=this.archive.idArchive;
        // @ts-ignore
        document.getElementById('idRevue').value=this.archive.idRevue;
        // @ts-ignore
        document.getElementById('conserverPap').value=this.archive.conserverPap;
        // @ts-ignore
        document.getElementById('anneeDebut').value=this.archive.anneeDebut;
        // @ts-ignore
        document.getElementById('anneeFin').value=this.archive.anneeFin;
        // @ts-ignore
        document.getElementById('volDebut').value=this.archive.volDebut;
        // @ts-ignore
        document.getElementById('volFin').value=this.archive.volFin;
        // @ts-ignore
        document.getElementById('embargo').value=this.archive.embargo;
        // @ts-ignore
        document.getElementById('fournisseur').value=this.archive.fournisseur;
      }

    });
  }

  //retour sur le profil periodique
  goBack(): void {
    //retour sur la liste des periodiques
    this.router.navigate(['/periodique/'+this.id]);
  }

  //fonction pour inserer
  post( archive:Archive): void {

    this.archives$ = this.periodiqueArchiveService
      .post(archive)
      .pipe(tap(() => (this.afficherNotification('periodique/archive/'+archive.idRevue))));
  }

  update(	archive:Archive): void {
    //cacher le bouton enregistrer
    this.methodesGlobal.nonAfficher('saveBoutton');

    this.archives$ = this.periodiqueArchiveService
      .update(archive)
      .pipe(tap(() => (this.afficherNotification('periodique/archive/'+archive.idRevue))));

  }

  delete(id: number): void {
    let textAlert:string='';
    //changer le texte pour le boutton
    this.translate.get('message.supprimer-text').subscribe((res: string) => {
      textAlert=res;
    });
    if(window.confirm(textAlert)) {
      this.archives$ = this.periodiqueArchiveService
        .delete(id)
        .pipe(tap(() => (this.archives$ = this.fetchAll(id))));
        //afficher notification
        this.methodesGlobal.afficher('alert-archive-sup');
        let that=this;
        setTimeout(function(){
          that.methodesGlobal.nonAfficher('alert-archive-sup');
          that.reload('periodique/archive/'+that.idRevue);
        }, 2500);
    }
  }
  //consulter fiche
  consulter(id: number) {
    console.log(id);
    return this.periodiqueArchiveService.consulter(id);

  }
  //recouperer la liste des periodiques
  fetchAll(idRevue: number): Observable<Archive[]> {
    return this.periodiqueArchiveService.fetchAll(idRevue);
  }
  //reload la page
  async reload(url: string): Promise<boolean> {
    await this.router.navigateByUrl('.', { skipLocationChange: true });
    return this.router.navigateByUrl(url);
  }

  //afficher notification ensuite recharger la page
  afficherNotification(url:string){
    //afficher la notification
    this.methodesGlobal.afficher('alert-archive-add');
    let that=this;
    setTimeout(function(){
      that.methodesGlobal.nonAfficher('alert-archive-add');
      that.reload(url);
    }, 1000);

  }
  //fonction pour valider
  onSubmit(f: NgForm) {
    // @ts-ignore
    let action = document.getElementById('action').value
    //recouperer les donnes pour creer l'objet

    if(f.value.perennite)
      this.archive.perennite=f.value.perennite
    else this.archive.perennite=''

    if(f.value.conserverPap)
      this.archive.conserverPap=f.value.conserverPap
    else this.archive.conserverPap=''

    if(f.value.anneeDebut)
      this.archive.anneeDebut=f.value.anneeDebut
    else this.archive.anneeDebut=''

    if(f.value.anneeFin)
      this.archive.anneeFin=f.value.anneeFin
    else this.archive.anneeFin=''

    if(f.value.volDebut)
      this.archive.volDebut=f.value.volDebut
    else this.archive.volDebut=''

    if(f.value.volFin)
      this.archive.volFin=f.value.volFin
    else this.archive.volFin=''

    if(f.value.embargo)
      this.archive.embargo=f.value.embargo
    else this.archive.embargo=''

    if(f.value.embargo)
      this.archive.embargo=f.value.embargo
    else this.archive.embargo=''

    if(f.value.fournisseur)
      this.archive.fournisseur=f.value.fournisseur
    else this.archive.fournisseur=''


    this.archive.idRevue=Number(this.id)

   //definir les champs obligatoire
    let donnesValider:any={'anneeDebut':this.archive.anneeDebut}

   switch (action){
      case 'save':
        if(this.methodesGlobal.validationDonneesForm(donnesValider)){
          this.onFermeModal()
          this.update(this.archive)
        }
        //this.remplireFiche(this.idRevue)
        break
      case 'add':
        if(this.methodesGlobal.validationDonneesForm(donnesValider)){
          this.onFermeModal()
          this.post(this.archive)
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

function createListeArchive(idArchiveP:number,perenniteP:string,conserverPapP:string,anneeDebutP:string,anneeFinP:string,volDebutP:string,volFinP:string,embargoP:string,fournisseurP:string): ListeArchive {
  return {
    idArchive:idArchiveP,
    perennite: perenniteP,
    conserverPap: conserverPapP,
    anneeDebut: anneeDebutP,
    anneeFin: anneeFinP,
    volDebut: volDebutP,
    volFin: volFinP,
    embargo: embargoP,
    fournisseur:fournisseurP,
    modifier: '',
    supprimer: '',
  };
}
/** Class utilisée pour remplire le tableau avec la liste des périodiques**/
export interface ListeArchive {
  idArchive:number;
  perennite: string;
  conserverPap: string;
  anneeDebut: string;
  anneeFin: string;
  volDebut: string;
  volFin: string;
  embargo:string;
  fournisseur:string;
  modifier:string;
  supprimer:string;
}
