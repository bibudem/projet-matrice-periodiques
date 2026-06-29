import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  message: string = 'Vous êtes déconnecté !';
  courriel: string | undefined;
  password: string | undefined;
  isLoggedIn:boolean=false

  constructor(public authService: AuthService,
              public router: Router) { }

  async ngOnInit() {
    await this.login()
  }

  // Informe l'utilisateur sur son authentfication.
  setMessage() {
    this.message = this.authService.isLoggedIn ?
      'Vous êtes connecté.' : 'Identifiant ou mot de passe incorrect.';
  }


  // Connecte l'utilisateur auprès du Guard

  async login() {
    this.message = 'Tentative de connexion en cours ...';
    await this.authService.initLogin();
    this.setMessage();
    if (this.authService.isLoggedIn) {
      let redirect = this.authService.redirectUrl ? this.authService.redirectUrl : '/accueil';
      this.router.navigate([redirect]);
    } else {
      this.logout();
    }
  }

  // Logout l'utilisateur
  async logout() {
    localStorage.clear();
    await this.authService.logout();
  }


}
