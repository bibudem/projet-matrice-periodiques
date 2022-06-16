import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {Observable} from "rxjs";

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
        // @ts-ignore
        (await this.authService.login()).subscribe(() => {
          this.setMessage();
          if (this.authService.isLoggedIn) {
            // Récupère l'URL de redirection depuis le service d'authentification
            // Si aucune redirection n'a été définis, redirige l'utilisateur vers la page d'accueil.
            let redirect = this.authService.redirectUrl ? this.authService.redirectUrl : '/login';
            // Redirige l'utilisateur
            this.router.navigate([redirect]);
          } else {
            //alert('logout11')
            this.logout()
          }
        });
  }

  // Logout l'utilisateur
  async logout() {
    await this.authService.logout();
  }


}
