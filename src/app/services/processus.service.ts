import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from "rxjs";
import { catchError, tap } from "rxjs/operators";

import { ErrorHandlerService } from "./error-handler.service";
import { Processus } from "../models/Processus";

@Injectable({
  providedIn: "root",
})
export class ProcessusService {
  [x: string]: any;
  private url = "/api/processus";

  httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private http: HttpClient
  ) {}


  delete(id: number): Observable<any> {
    const url = this.url+'/delete/'+`${id}`;

    return this.http
      .delete<Processus>(url, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("delete")));
  }
  //chercher toute la liste des plateformes
  fetchAll(): Observable<Processus[]> {
    return this.http
      .get<Processus[]>(this.url+'/all', { responseType: "json" })
      .pipe(
        tap((_) => console.log("liste processus")),
        catchError(
          this.errorHandlerService.handleError<Processus[]>("fetchAll", [])
        )
      );
  }

  /******************Section mise a jour des prix*******************/

  updatePrix(prix: any): Observable<any> {
    const url = `/api/processus/save-prix`;
    //console.log(fond)
    return this.http
      .put<any>(url, prix, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("update prix")));
  }

  /******************Section mise a jour des abonnements*******************/

  updateAbonnement(abonnement: any): Observable<any> {
    const url = `/api/processus/save-abonnement`;
    //console.log(fond)
    return this.http
      .put<any>(url, abonnement, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("update abonnement")));
  }

}
