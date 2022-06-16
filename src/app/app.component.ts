import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {AuthService} from "./services/auth.service";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent {
  title = 'projet-matrice-periodiques';


  constructor(private translate: TranslateService,
              public authService: AuthService) {
    translate.setDefaultLang('fr');
  }

  ngOnInit() {



  }
  switchLanguage(language: string) {
    this.translate.use(language);
  }

  // Logout l'utilisateur
  async logout() {
    await this.authService.logout();
  }
}
