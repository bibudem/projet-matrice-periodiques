import { HttpClient, HttpHeaders } from "@angular/common/http";
import {Injectable, OnInit} from "@angular/core";
// RxJS 6
import { Observable, of } from 'rxjs';
import {tap, delay, catchError} from 'rxjs/operators';

import {User} from "../models/User";

import { ErrorHandlerService } from "./error-handler.service";
import { Inject } from "@angular/core";
import {DOCUMENT} from "@angular/common";
@Injectable()
export class AuthService {
  isLoggedIn: boolean = false; // L'utilisateur est-il connecté ?


  redirectUrl: string| undefined='/accueil'; // où rediriger l'utilisateur après l'authentification ?

  // @ts-ignore
  public user: User = {};
  private data: any;

  constructor(private http: HttpClient,
              private errorHandlerService: ErrorHandlerService,
              @Inject(DOCUMENT) readonly document: Document) {}


  // Une méthode de connexion
  // @ts-ignore
  async login(): Promise<Observable<boolean>> {
    let isLoggedIn: boolean ;
    caches.keys().then((keyList) =>  Promise.all(keyList.map((key) => caches.delete(key))))
    // Appel au service d'authentification en mode asyncrone
    try {
      //reconnect le bon user
      await this.http
        .get<User>(`/api/user-udem`, {responseType: "json"})
        .toPromise()
        .then((res: any) => {
            // Success
          if(res.length==0){
            isLoggedIn=false;
            this.logout()
          }

          this.user=res;
          //Souvegarder les infos du user// @ts-ignore
          isLoggedIn=true;
          //supprimer une fois authentification est instalé

          sessionStorage.setItem('nomAdmin', this.user.nom);
          sessionStorage.setItem('prenomAdmin', this.user.prenom);
          sessionStorage.setItem('courrielAdmin', this.user.courriel);

          switch (this.user.groupe){
            case 'Admin':
              sessionStorage.setItem('groupeAdmin', 'Gestionnaire');
              sessionStorage.setItem('role', 'Admin');
              break
            case 'Viewer':
              sessionStorage.setItem('groupeAdmin', 'Bibliothécaire');
              sessionStorage.setItem('role', 'Viewer');
              break
            default:
              window.location.href ='/not-user'
          }

          }

        );
    } catch (e : any){
      isLoggedIn=false;
      await this.logout()
      console.log('Erreur login http'+e);
    }

    //console.log(isLoggedIn);
    return of(true).pipe(
      delay(100),
      tap(val => this.isLoggedIn = isLoggedIn)
    );
  }

  // Une méthode de déconnexion

  async logout() {

    this.isLoggedIn = false;
    sessionStorage.clear()
    sessionStorage.setItem('isLoggedIn', 'true')
    caches.keys().then((keyList) =>  Promise.all(keyList.map((key) => caches.delete(key))))

    window.location.href = '/api/logout'
  }

  /** Redirects to the specified external link with the mediation of the router */
  public redirect(url: string): Promise<boolean> {

    return new Promise<boolean>( (resolve, reject) => {

      try { // @ts-ignore
        this.window.location.href=url }
      catch(e) { reject(e); }
    });
  }


}
