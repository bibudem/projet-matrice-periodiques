import { Component, OnInit } from '@angular/core';
import {MethodesGlobal} from "../../../../lib/MethodesGlobal";
import {TranslateService} from "@ngx-translate/core";
import {OutilsService} from "../../../../services/outils.service";
import {Plateforme} from "../../../../models/Plateforme";
import {Observable} from "rxjs";
import {tap} from "rxjs/operators";
import {Router} from "@angular/router";

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

  constructor( private periodiquePlateformeService: OutilsService,
               private translate: TranslateService,
               private router: Router,) { }

  ngOnInit(): void {
    //cacher le boutton add
    this.methodesGlobal.nonAfficher('div-save');
    this.methodesGlobal.nonAfficher('btn-supprimer');
    this.methodesGlobal.afficher('div-add');
    //afficher les variable
    console.log('id plateforme: '+localStorage.getItem('idPlateforme'))
    //recouperer le bon titre du bouton
    this.translate.get('btn-ajouter').subscribe((res: string) => {
      this.bouttonAction=res;
    });
    //valeur de l'action
    this.action=localStorage.getItem('action');
    //valeur du idPlateforme
    this.idPlateforme=localStorage.getItem('idPlateforme');
    //prendre la fiche si l'action est save
    if(this.idPlateforme!=null && this.action=='save'){
      //recouperer le bon titre du bouton
      this.translate.get('btn-modifier').subscribe((res: string) => {
        this.bouttonAction=res;
      });
      this.plateformes$ = this.consulter(this.methodesGlobal.convertNumber(this.idPlateforme));
      this.plateformes$.subscribe(res => {
        this.plateforme =res[0];
        console.log(this.plateforme);
      });
      //cacher le boutton add
      this.methodesGlobal.afficher('div-save');
      this.methodesGlobal.afficher('btn-supprimer');
      this.methodesGlobal.nonAfficher('div-add');

      //changer le texte pour le boutton
      //recouperer le bon titre du bouton
      this.translate.get('btn-enregistrer').subscribe((res: string) => {
        this.bouttonAction=res;
      });
    }
    //afficher le form vide si l'action est add une fiche
    if(this.action=='add'){
      //cacher le boutton add
      this.methodesGlobal.nonAfficher('div-save');
      this.methodesGlobal.afficher('div-add');
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
  //supprimer un enregistrement
  delete(id: number): void {
    console.log(id);
    this.plateformes$ = this.periodiquePlateformeService
      .delete(id)
      .pipe(tap(() => (this.goBack())));
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

