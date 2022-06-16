import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from "rxjs";
import { catchError, tap } from "rxjs/operators";

import { ErrorHandlerService } from "./error-handler.service";

import { Historique } from "../models/Historique";

@Injectable({
  providedIn: "root",
})
export class PeriodiqueHistoriqueService {
  [x: string]: any;
  private url = "/api/historique";

  httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private http: HttpClient
  ) {}


  post(historique: Historique): Observable<any> {
    console.log(this.url+'/add');
    return this.http
      .post<Partial<Historique>>(this.url+'/add', historique, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("post")));
  }

  update(historique: Historique): Observable<any> {
    return this.http
      .put<Historique>(this.url+'/save', historique, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("update")));
  }

  delete(id: number): Observable<any> {
    const url = `/api/historique/delete/${id}`;

    return this.http
      .delete<Historique>(url, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("delete")));
  }
  //chercher toute la liste des archives
  fetchAll(idRevue: number): Observable<Historique[]> {
    return this.http
      .get<Historique[]>(this.url+'/all/'+idRevue, { responseType: "json" })
      .pipe(
        tap((_) => console.log("liste archives pour une periodique")),
        catchError(
          this.errorHandlerService.handleError<Historique[]>("fetchAll", [])
        )
      );
  }
  //consulter les données d'une archive
  consulter(id: number): Observable<any> {
    const url = `/api/historique/fiche/${id}`;
    return this.http
      .get<Historique>(url, { responseType: "json" })
      .pipe(catchError(this.errorHandlerService.handleError<any>("consulter")));

  }

}
