import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Injectable, OnInit} from "@angular/core";

import { Observable } from "rxjs";
import { catchError, tap } from "rxjs/operators";

import { ErrorHandlerService } from "./error-handler.service";

import { Periodique } from "../models/Periodique";
import {NavigationEnd, Router} from "@angular/router";
import {buildFiltresParams} from "../lib/httpFiltres";


@Injectable({
  providedIn: "root",
})
export class PeriodiqueListeService implements OnInit {
  private url = "/api/periodique";

  httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };
  private modalService: any;

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private http: HttpClient,private router: Router
  ) {}

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // close all open modals
        this.modalService.dismissAll();
      }
    });
  }
//chercher toute la liste
  fetchAll(): Observable<Periodique[]> {
    return this.http
      .get<Periodique[]>(this.url+'/all', { responseType: "json" })
      .pipe(
        tap((_) => console.log("fetched periodiques")),
        catchError(
          this.errorHandlerService.handleError<Periodique[]>("fetchAll", [])
        )
      );
  }

  // Récupérer les périodiques avec pagination, recherche et tri
  fetchAllPaginated(skip: number, limit: number, search: string = '', sortColumn: string = 'titre', sortDirection: string = 'asc'): Observable<any> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString())
      .set('sortColumn', sortColumn)
      .set('sortDirection', sortDirection);

    if (search && search.trim()) {
      params = params.set('search', search);
    }

    return this.http
      .get<any>(this.url + '/all', { params, responseType: "json" })
      .pipe(
        tap((_) => console.log("fetched periodiques paginated")),
        catchError(
          this.errorHandlerService.handleError<any>("fetchAllPaginated", { data: [], total: 0 })
        )
      );
  }

  //chercher toute la liste des periodiques filtree selon les criteres du rapport (filtrage cote serveur)
  fetchRapportAll(filtres: any): Observable<any[]> {
    const params = buildFiltresParams(filtres);
    return this.http
      .get<any[]>(`/api/periodique/rapport-all`, { params, responseType: "json" })
      .pipe(
        tap((_) => console.log("fetched periodiques raport")),
        catchError(
          this.errorHandlerService.handleError<any[]>("fetchRapportAll", [])
        )
      );
  }
  //chercher les notes/prix associes, filtres selon les memes criteres que fetchRapportAll
  fetchRapportChampsAutres(filtres: any): Observable<any[]> {
    const params = buildFiltresParams(filtres);
    return this.http
      .get<any[]>(`/api/periodique/rapport-autres`, { params, responseType: "json" })
      .pipe(
        tap((_) => console.log("fetched periodiques raport autres")),
        catchError(
          this.errorHandlerService.handleError<any[]>("fetchRapportChampsAutres", [])
        )
      );
  }
  //supprimer une fiche
  delete(id: number): Observable<any> {
    const url = `/api/periodique/delete/${id}`;
    return this.http
      .delete<Periodique>(url, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("delete")));
  }

}
