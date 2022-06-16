import {Component, Inject, OnInit} from '@angular/core';
import {AuthService} from "../services/auth.service";
import {TranslateService} from "@ngx-translate/core";
import { Router } from '@angular/router';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  //chercher le nom de la session
  nomAdmin: string | null = '';
  prenomAdmin : string | null = '';
  groupeAdmin : string | null = '';
  message: string = 'Vous êtes déconnecté.';
  flagChoix:string= 'flag-icon-fr';




  constructor(public authService: AuthService,
              private translate: TranslateService,
              public router: Router) { }
  ngOnInit(){

    this.translate.setDefaultLang('fr');
    this.flagChoix= 'flag-icon-fr';
    //chercher le nom de la session
    this.nomAdmin = sessionStorage.getItem('nomAdmin');
    this.prenomAdmin = sessionStorage.getItem('prenomAdmin');
    this.groupeAdmin = sessionStorage.getItem('groupeAdmin');


  }
  // Informe l'utilisateur sur son authentfication.
  setMessage() {
    this.message = this.authService.isLoggedIn ?
      'Vous êtes connecté.' : 'Identifiant ou mot de passe incorrect.';
  }
  // Déconnecte l'utilisateur
  logout() {
    this.authService.logout();
  }

  //fonction pour changer la langue
  switchLanguage(language: string) {
    this.translate.use(language);
    this.flagChoix= 'flag-icon-'+language;
    switch (language) {
      case'fr':
        this.flagChoix= 'flag-icon-'+language;
        break;
      case'en':
        this.flagChoix= 'flag-icon-us';
        break;
      default:this.flagChoix= 'flag-icon-fr';
        break;
    }
  }



}
