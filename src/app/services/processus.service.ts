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

  deleteDetails(id: number): Observable<any> {
    const url = this.url+'/details/delete/'+`${id}`;

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
  //chercher les details du processus
  fetchAllDetails(id:string): Observable<any[]> {
    return this.http
      .get<any[]>(this.url+'/liste-details/'+id, { responseType: "json" })
      .pipe(
        tap((_) => console.log("liste processus")),
        catchError(
          this.errorHandlerService.handleError<any[]>("fetchAllDetails", [])
        )
      );
  }
  //chercher le dernier id du Processus
  lastIdProcessus(): Observable<any[]> {
    return this.http
      .get<any[]>(this.url+'/last-processus', { responseType: "json" })
      .pipe(
        tap((_) => console.log("le dernier id du Processus")),
        catchError(
          this.errorHandlerService.handleError<any[]>("dernier id du Processus", [])
        )
      );
  }

  /******************Section mise a jour des prix*******************/

  updatePrix(prix: any): Observable<any[]> {
    const url = `/api/processus/save-prix`;
    //console.log(prix)
    return this.http
      .put<any>(url, prix, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("update prix")));
  }

  /******************Section mise a jour des statistiques*******************/

  updateStatistiques(statistiques: any): Observable<any[]> {
    const url = `/api/processus/update-statistiques`;
    //console.log(statistiques)
    return  this.http
      .put<any>(url, statistiques, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("update statistiques")));
  }

  /******************Section mise a jour des periodiques*******************/

  updateLotPeriodiques(periodiques: any): Observable<any[]> {
    const url = `/api/processus/lot-periodiques`;
    //console.log(periodiques)
    return this.http
      .post<any>(url, periodiques, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("update periodiques")));
  }

  /******************Section mise a jour des abonnements*******************/

  updateAbonnement(abonnement: any): Observable<any[]> {
    const url = `/api/processus/save-abonnement`;
    //console.log(abonnement)
    return this.http
      .put<any>(url, abonnement, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("update abonnement")));
  }

  addProcessus(processus: any): Observable<any[]>{
    const url = `/api/processus/add`;
    //console.log(processus);
    return this.http
      .put<any>(url, processus, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("add processus")));
  }


}
