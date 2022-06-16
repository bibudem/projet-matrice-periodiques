import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from "rxjs";
import { catchError, tap } from "rxjs/operators";

import { ErrorHandlerService } from "./error-handler.service";

import { Plateforme } from "../models/Plateforme";
import {Note} from "../models/Note";

@Injectable({
  providedIn: "root",
})
export class OutilsService {
  [x: string]: any;
  private url = "https://matrice-dev.bib.umontreal.ca/api/plateforme";

  httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private http: HttpClient
  ) {}


  post(plateforme: { newtitrePlateforme: string; newPlatformID: string; newConsortiumApiKey: string; newConsortiumCustID: string; newPlatformCode: string; newNote: string; newConsortiumRequestorID: string; newUrlSushi: string }): Observable<any> {
    //console.log(this.url+'/add');
    return this.http
      .post<Partial<Plateforme>>(this.url+'/add', plateforme, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("post")));
  }

  update(plateforme: Plateforme): Observable<any> {
    return this.http
      .put<Plateforme>(this.url+'/save', plateforme, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("update")));
  }

  delete(id: number): Observable<any> {
    const url = `https://matrice-dev.bib.umontreal.ca/api/plateforme/delete/${id}`;

    return this.http
      .delete<Plateforme>(url, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("delete")));
  }
  //chercher toute la liste des plateformes
  fetchAll(): Observable<Plateforme[]> {
    return this.http
      .get<Plateforme[]>(this.url+'/all', { responseType: "json" })
      .pipe(
        tap((_) => console.log("liste plateformes")),
        catchError(
          this.errorHandlerService.handleError<Plateforme[]>("fetchAll", [])
        )
      );
  }
  //chercher toute la liste des plateformes avec les statistique pour le rapport
  rapportPlateformes(annee:string): Observable<any[]> {
    return this.http
      .get<any[]>(`/api/outils/rapport-plateformes/${annee}`, { responseType: "json" })
      .pipe(
        tap((_) => console.log("rapport plateformes")),
        catchError(
          this.errorHandlerService.handleError<any[]>("rapportPlateformes", [])
        )
      );
  }
  //consulter les données d'une archive
  consulter(id: number): Observable<any> {
    const url = `/api/plateforme/fiche/${id}`;
    return this.http
      .get<Plateforme>(url, { responseType: "json" })
      .pipe(catchError(this.errorHandlerService.handleError<any>("consulter")));
  }

/******************Section pour la gestion des fonds*******************/

  postFond(fond: any): Observable<any> {
    const url = `/api/outils/add-fond`;
  //console.log(fond)
    return this.http
      .post<Partial<any>>(url, fond, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("post")));
  }

  updateFond(fond: any): Observable<any> {
    const url = `/api/outils/save-fond`;
    //console.log(fond)
    return this.http
      .put<any>(url, fond, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("update")));
  }

  deleteFond(id: number): Observable<any> {
    const url = `/api/outils/delete-fond/${id}`;
    return this.http
      .delete<any>(url, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("delete")));
  }
  //chercher toute la liste des archives
  allFonds(): Observable<any[]> {
    const url = `/api/outils/all-fonds`;
    //console.log(url)
    return this.http
      .get<any[]>(url, { responseType: "json" })
      .pipe(
        tap((_) => console.log("liste fonds")),
        catchError(
          this.errorHandlerService.handleError<any[]>("all fonds", [])
        )
      );
  }
  //consulter les données d'une archive
  consulterFond(id: number): Observable<any> {
    const url = `/api/outils/fiche-fond/${id}`;
    return this.http
      .get<any>(url, { responseType: "json" })
      .pipe(catchError(this.errorHandlerService.handleError<any>("consulter fond")));
  }

  //consulter les données importés par SUSHI selon le rapport
  resultatRapport(annee:string, plateforme:string,rapport:string): Observable<any> {
      if(plateforme=='')
         plateforme='vide'

    let paramResults=annee+'='+''+plateforme+'='+rapport

    let params=new HttpParams().set('result', paramResults)

    const url = `/api/outils/brut/${params}`;
    console.log(url)
    return this.http
      .get<any>(url, { responseType: "json" })
      .pipe(catchError(this.errorHandlerService.handleError<any>("consulter données brutes")));
  }
}
