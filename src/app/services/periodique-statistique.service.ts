import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from "rxjs";
import { catchError, tap } from "rxjs/operators";

import { ErrorHandlerService } from "./error-handler.service";

import { Statistique } from "../models/Statistique";

@Injectable({
  providedIn: "root",
})
export class PeriodiqueStatistiquesService {
  [x: string]: any;
  private url = "/api/statistique";

  httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private http: HttpClient
  ) {}


  post(statistique: Statistique): Observable<any> {
    console.log(this.url+'/add');
    return this.http
      .post<Partial<Statistique>>(this.url+'/add', statistique, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("post")));
  }

  update(statistique: Statistique): Observable<any> {
    return this.http
      .put<Statistique>(this.url+'/save', statistique, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("update")));
  }

  delete(id: number): Observable<any> {
    const url = `/api/statistique/delete/${id}`;

    return this.http
      .delete<Statistique>(url, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("delete")));
  }
  //chercher toute la liste des archives
  fetchAll(idRevue: number): Observable<Statistique[]> {
    return this.http
      .get<Statistique[]>(this.url+'/all/'+idRevue, { responseType: "json" })
      .pipe(
        tap((_) => console.log("liste des statistique pour une periodique")),
        catchError(
          this.errorHandlerService.handleError<Statistique[]>("fetchAll", [])
        )
      );
  }
  //consulter les données d'une archive
  consulter(id: number): Observable<any> {
    const url = `/api/statistique/fiche/${id}`;
    return this.http
      .get<Statistique>(url, { responseType: "json" })
      .pipe(catchError(this.errorHandlerService.handleError<any>("consulter")));
  }

}
