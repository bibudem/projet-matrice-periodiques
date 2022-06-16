import {Injectable, OnInit} from "@angular/core";
import { Observable, throwError } from "rxjs";
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse, HttpParams
} from "@angular/common/http";
import {catchError, map, tap} from "rxjs/operators";

import { ErrorHandlerService } from "./error-handler.service";
import {Periodique} from "../models/Periodique";



@Injectable({
  providedIn: "root",
})

export class UpdateStatistiqueService implements OnInit {


  // directive necessaire pour pouvoir lire l'url
  httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };

  constructor( private errorHandlerService: ErrorHandlerService,
               private http: HttpClient) { }

  ngOnInit() {}
  //chercher toute la liste
  updateStatistique(annee:string): Observable<any[]> {
    const url = `/api/update-statistique/${annee}`;
    return this.http
      .get<any[]>(url, { responseType: "json" })
      .pipe(
        tap((_) => console.log("update soushi statistiques")),
        catchError(
          this.errorHandlerService.handleError<any[]>("updateStatistique", [])
        )
      );
  }
}
