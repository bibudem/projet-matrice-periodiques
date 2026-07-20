import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from "rxjs";
import { catchError, tap } from "rxjs/operators";

import { ErrorHandlerService } from "./error-handler.service";

import {ListeStatistique} from "../models/ListeStatistique";
import {buildFiltresParams} from "../lib/httpFiltres";

@Injectable({
  providedIn: "root",
})
export class ListeStatistiquesService {
  [x: string]: any;

  httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private http: HttpClient
  ) {}

  //chercher toute la liste des statistiques
  fetchAll(annee:string): Observable<ListeStatistique[]> {
    return this.http
      .get<ListeStatistique[]>(`/api/liste-statistique/${annee}`, { responseType: "json" })
      .pipe(
        tap((_) => console.log("statistique liste")),
        catchError(
          this.errorHandlerService.handleError<ListeStatistique[]>("fetchAll", [])
        )
      );
  }

  fetchAllPaginated(annee: string, skip: number, limit: number, search: string, sortColumn: string, sortDirection: string): Observable<any> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString())
      .set('search', search)
      .set('sortColumn', sortColumn)
      .set('sortDirection', sortDirection);
    return this.http
      .get<any>(`/api/liste-statistique/${annee}`, { params, responseType: "json" })
      .pipe(
        catchError(this.errorHandlerService.handleError<any>("fetchAllPaginated", []))
      );
  }

  //chercher toute la liste des statistiques filtree selon les criteres du rapport (filtrage cote serveur)
  rapportStatistiques(annees: any, filtres: any): Observable<any[]> {
    const params = buildFiltresParams(filtres, { annees: Array.isArray(annees) ? annees.join(',') : annees });
    return this.http
      .get<any[]>(`/api/liste-statistique/rapport`, { params, responseType: "json" })
      .pipe(
        tap((_) => console.log("rapport statistiques")),
        catchError(
          this.errorHandlerService.handleError<any[]>("rapportStatistiques", [])
        )
      );
  }

}
