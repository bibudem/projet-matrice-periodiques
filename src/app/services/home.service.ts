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
export class HomeService {
  [x: string]: any;
  private url = "/api/home";

  httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private http: HttpClient
  ) {}

  //chercher le total des logs
  getCount(): Observable<any[]> {
    //console.log(this.url+'/count')
    return this.http
      .get<any[]>(this.url+'/count', { responseType: "json" })
      .pipe(
        tap((_) => console.log("total données")),
        catchError(
          this.errorHandlerService.handleError<any[]>("getCount", [])
        )
      );
  }

  //chercher les donnees pour le graphique
  getGraphiqueDonnees(): Observable<any[]> {
    return this.http
      .get<any[]>(this.url+'/graphique', { responseType: "json" })
      .pipe(
        tap((_) => console.log("graphique données")),
        catchError(
          this.errorHandlerService.handleError<any[]>("getCount", [])
        )
      );
  }

}
