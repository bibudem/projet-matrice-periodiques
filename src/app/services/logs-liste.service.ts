import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from "rxjs";
import { catchError, tap } from "rxjs/operators";

import { ErrorHandlerService } from "./error-handler.service";

import { Plateforme } from "../models/Plateforme";
import {Note} from "../models/Note";

@Injectable({
  providedIn: "root",
})
export class LogsListeServiceService {
  [x: string]: any;
  private url = "/api/logs";

  httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private http: HttpClient
  ) {}


  //chercher la liste des logs des periodiques
  getAllLogsRevue(): Observable<any[]> {
    return this.http
      .get<any[]>(this.url+'/revue', { responseType: "json" })
      .pipe(
        tap((_) => console.log("liste logs revue")),
        catchError(
          this.errorHandlerService.handleError<any[]>("getAllLogsRevue", [])
        )
      );
  }

  //chercher la liste des logs des plateformes
  getAllLogsPlateforme(): Observable<any[]> {
    return this.http
      .get<any[]>(this.url+'/plateforme', { responseType: "json" })
      .pipe(
        tap((_) => console.log("liste logs plateformes")),
        catchError(
          this.errorHandlerService.handleError<any[]>("getAllLogsPlateforme", [])
        )
      );
  }

  //chercher le total des logs
  getCount(): Observable<any[]> {
    return this.http
      .get<any[]>(this.url+'/count', { responseType: "json" })
      .pipe(
        tap((_) => console.log("total logs")),
        catchError(
          this.errorHandlerService.handleError<any[]>("getCount", [])
        )
      );
  }
  //supprimer les logs des revue
  deleteLogsRevue(id: number): Observable<any> {
    const url = this.url+`/delete-logs-revue/${id}`;

    return this.http
      .delete<any>(url, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("delete")));
  }

  //supprimer les logs des revue
  deleteLogsPLateforme(id: number): Observable<any> {
    const url = this.url+`/delete-logs-plateforme/${id}`;
    console.log(url)
    return this.http
      .delete<any>(url, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("delete")));
  }

}
