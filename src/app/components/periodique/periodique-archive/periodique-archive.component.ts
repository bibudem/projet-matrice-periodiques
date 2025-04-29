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
  archives$: Observable<any[]> | undefined;

  //creation d'objet avec la liste des periodiques
  // @ts-ignore
  archive: any = {};
  id: string | null | undefined ;
  //les entêts du tableau
  displayedColumns = ['idArchive','perennite', 'conserverPap', 'anneeDebut', 'anneeFin','volDebut','volFin','embargo','fournisseur','dateA','dateM','modiffier','supprimer'];
  tableauArchives: any = [];
  // @ts-ignore
  dataSource: MatTableDataSource<ListeArchive>;
  @ViewChild(MatPaginator) paginator: paginationPersonnalise | any;

  //importer les fonctions global
  methodesGlobal: MethodesGlobal = new MethodesGlobal();

  //definir le text pour les boutons
  bouttonAction='';

  titrePeriodique=localStorage.getItem('titrePeridique');

  idRevue=localStorage.getItem('idRevue');

  action='add';

  ifAdmin=false;

  @ViewChild('closebutton') closebutton:any

  constructor( private router: Router,
               private route: ActivatedRoute,
               private periodiqueArchiveService: PeriodiqueArchiveService,
               private translate: TranslateService) { }

  ngOnInit(): void {

    //ajout de niveau de securité
    this.ifAdmin=this.methodesGlobal.ifAdminFunction();

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
            this.tableauArchives[i]={
              "nr":i+1,
              "idArchive":res[i].idArchive,
              "idRevue":res[i].idRevue,
              "perennite":res[i].perennite,
              "conserverPap":res[i].conserverPap,
              "anneeDebut":res[i].anneeDebut,
              "anneeFin":res[i].anneeFin,
              "volDebut":res[i].volDebut,
              "volFin":res[i].volFin,
              "embargo":res[i].embargo,
              "fournisseur":res[i].fournisseur,
              "dateA":res[i].dateA,
              "dateM":res[i].dateM,
            }

          }
          // Redéfinir le contenu de la table avec la pagination est la recherche une fois que le resultat de la bd est returné
          this.dataSource = new MatTableDataSource(this.tableauArchives);
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
    this.action='save';

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

  async delete(id: number) {

    let textAlert:string='';
    //changer le texte pour le boutton
    this.translate.get('message.supprimer-text').subscribe((res: string) => {
      textAlert=res;
    });
    if(window.confirm(textAlert)) {
      this.archives$ = await this.periodiqueArchiveService
        .delete(id)
        .pipe(tap(() => (this.archives$ = this.fetchAll(id))));
        //afficher notification
        this.methodesGlobal.afficher('alert-archive-sup');
        let that=this;
        setTimeout(function(){
          that.methodesGlobal.nonAfficher('alert-archive-sup');
          that.reload('periodique/archive/'+that.id);
        }, 1500);
    }
  }
  //consulter fiche
  consulter(id: number) {
    //console.log(id);
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

    this.archive = {
      idRevue: this.id,
      perennite: this.methodesGlobal.returnCharIfNull(f.value.perennite),
      conserverPap: this.methodesGlobal.returnCharIfNull(f.value.conserverPap),
      anneeDebut: this.methodesGlobal.returnCharIfNull(f.value.anneeDebut),
      anneeFin: this.methodesGlobal.returnCharIfNull(f.value.anneeFin),
      volDebut:this.methodesGlobal.returnCharIfNull(f.value.volDebut),
      volFin:this.methodesGlobal.returnCharIfNull(f.value.volFin),
      embargo:this.methodesGlobal.returnCharIfNull(f.value.embargo),
      fournisseur:this.methodesGlobal.returnCharIfNull(f.value.fournisseur),
      idArchives:this.methodesGlobal.returnCharIfNull(f.value.idArchive),
    }

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
