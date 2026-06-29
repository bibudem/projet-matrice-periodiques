import { Component, OnInit } from '@angular/core';
import {MethodesGlobal} from "../../../../lib/MethodesGlobal";
import {TranslateService} from "@ngx-translate/core";
import {OutilsService} from "../../../../services/outils.service";
import {Plateforme} from "../../../../models/Plateforme";
import {Observable} from "rxjs";
import {tap} from "rxjs/operators";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmDialogComponent} from "../../../../lib/confirm-suppression-dialog.component";

@Component({
  selector: 'app-plateforme-form',
  templateUrl: './plateforme-form.component.html',
  styleUrls: ['./plateforme-form.component.css']
})
export class PlateformeFormComponent implements OnInit {

  //importer la fiche de plateforme
  plateformes$: Observable<any> | undefined;
  plateforme: Plateforme = {
    ConsortiumApiKey: "",
    ConsortiumCustID: "",
    ConsortiumRequestorID: "",
    PlatformCode: "",
    PlatformID: "",
    SUSHIURL: "",
    idPlateforme: 0,
    note: "",
    titrePlateforme: ""
  };
  //valeur de l'action
  action: string | null ='';
  //valeur du idPlateforme
  idPlateforme: string | null ='';

//importer les fonctions global
  methodesGlobal: MethodesGlobal = new MethodesGlobal();

  //titre boutton
  bouttonAction='';

  constructor(
    private periodiquePlateformeService: OutilsService,
    private translate: TranslateService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.methodesGlobal.nonAfficher('btn-supprimer');
    console.log('id plateforme: ' + localStorage.getItem('idPlateforme'));
    this.translate.get('btn-ajouter').subscribe((res: string) => {
      this.bouttonAction = res;
    });
    this.action = localStorage.getItem('action');
    this.idPlateforme = localStorage.getItem('idPlateforme');

    if (this.idPlateforme != null && this.action == 'save') {
      this.translate.get('btn-modifier').subscribe((res: string) => {
        this.bouttonAction = res;
      });
      this.plateformes$ = this.consulter(this.methodesGlobal.convertNumber(this.idPlateforme));
      this.plateformes$.subscribe(res => {
        this.plateforme = res[0];
      });
      this.methodesGlobal.afficher('btn-supprimer');
      this.translate.get('btn-enregistrer').subscribe((res: string) => {
        this.bouttonAction = res;
      });
    }
  }
  //consulter une fiche
  consulter(id: number) {
    console.log(id);
    return this.periodiquePlateformeService.consulter(id)
  }
  //retour sur la liste des periodiques
  goBack(): void {
    this.router.navigate(['/plateformes']);
  }
  confirmerModification(): void {
    const isAdd = this.action === 'add-plateforme';
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        titre: isAdd ? 'Ajouter la plateforme' : 'Enregistrer les modifications',
        message: isAdd
          ? 'Êtes-vous sûr de vouloir ajouter cette plateforme ?'
          : `Êtes-vous sûr de vouloir enregistrer les modifications apportées à « ${this.plateforme.titrePlateforme} » ?`,
        confirmLabel: isAdd ? 'Ajouter' : 'Enregistrer',
        confirmColor: 'primary'
      }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      if (isAdd) {
        this.post(
          this.plateforme.PlatformID,
          this.plateforme.titrePlateforme,
          this.plateforme.note,
          this.plateforme.SUSHIURL,
          this.plateforme.ConsortiumCustID,
          this.plateforme.ConsortiumRequestorID,
          this.plateforme.ConsortiumApiKey,
          this.plateforme.PlatformCode
        );
      } else {
        this.update(
          this.plateforme.idPlateforme,
          this.plateforme.PlatformID,
          this.plateforme.titrePlateforme,
          this.plateforme.note,
          this.plateforme.SUSHIURL,
          this.plateforme.ConsortiumCustID,
          this.plateforme.ConsortiumRequestorID,
          this.plateforme.ConsortiumApiKey,
          this.plateforme.PlatformCode
        );
      }
    });
  }

  //supprimer un enregistrement
  confirmerSuppression(id: number, titre: string): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        titre: 'Supprimer la plateforme',
        message: `Êtes-vous sûr de vouloir supprimer la plateforme « ${titre} » ? Cette action est irréversible.`,
        confirmLabel: 'Supprimer',
        confirmColor: 'warn'
      }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.periodiquePlateformeService.delete(id).subscribe({
        next: () => this.goBack(),
        error: (err: any) => console.error('Erreur suppression plateforme', err)
      });
    });
  }
  //fonction pour inserer
  post( newPlatformID: string,newtitrePlateforme: string,newNote: string,
        newUrlSushi: string,newConsortiumCustID: string,newConsortiumRequestorID: string,
        newConsortiumApiKey: string,newPlatformCode: string): void {
    if (!newtitrePlateforme) return;

    this.plateformes$ = this.periodiquePlateformeService
      .post({
        newPlatformID,
        newtitrePlateforme,
        newNote,
        newUrlSushi,
        newConsortiumCustID,
        newConsortiumRequestorID,
        newConsortiumApiKey,
        newPlatformCode
      })
      .pipe(tap(() => (this.afficherAlert())));
  }
//mise a jour du formulaire
  update(	idPlateforme: number, newPlatformID: string,newtitrePlateforme: string,newNote: string,
           newUrlSushi: string,newConsortiumCustID: string,newConsortiumRequestorID: string,
           newConsortiumApiKey: string,newPlatformCode: string): void {
    const PlatformID = (<string>newPlatformID).trim();
    const titrePlateforme = (<string>newtitrePlateforme).trim();
    const note = (<string>newNote).trim();
    const SUSHIURL = (<string>newUrlSushi).trim();
    const ConsortiumCustID = (<string>newConsortiumCustID).trim();
    const ConsortiumRequestorID = (<string>newConsortiumRequestorID).trim();
    const ConsortiumApiKey = (<string>newConsortiumApiKey).trim();
    const PlatformCode = (<string>newPlatformCode).trim();
    if (!titrePlateforme) return;
    // console.log('MODIFIER FICHE: ');
    const newPlateforme: Plateforme = {
      idPlateforme,
      PlatformID,
      titrePlateforme,
      note,
      SUSHIURL,
      ConsortiumCustID,
      ConsortiumRequestorID,
      ConsortiumApiKey,
      PlatformCode
    };

    this.plateformes$ = this.periodiquePlateformeService
      .update(newPlateforme)
      .pipe(tap(() => (
              this.afficherAlert()
       )));
  }
  //afficher les notification
  afficherAlert(){
    let that=this;
    that.methodesGlobal.afficher('alert-save')
    setTimeout(function(){
      that.methodesGlobal.nonAfficher('alert-save')
    }, 2500)
  }
}

