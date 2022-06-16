import {Injectable, OnInit} from "@angular/core";
import { Observable, throwError } from "rxjs";
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse, HttpParams
} from "@angular/common/http";
import {catchError, map, tap} from "rxjs/operators";

import { ErrorHandlerService } from "./error-handler.service";


@Injectable({
  providedIn: "root",
})

export class ImportationSushiService implements OnInit {


  // directive necessaire pour pouvoir lire l'url
  httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };

  constructor( private errorHandlerService: ErrorHandlerService,
               private http: HttpClient) { }

  ngOnInit() {}
  //chercher toute la liste des archives
  fetchAll(annee:string,plateforme:string): Observable<any[]> {
    let begin_date=annee+'-01-01'
    let end_date=annee+'-12-31'

    let paramResults=begin_date+'='+''+end_date+'='+plateforme

    let params=new HttpParams().set('date', paramResults)

    return this.http
      .get<any[]>(`/api/importation/rapports-sushi/${params}`, { responseType: "json" })
      .pipe(
        tap((_) => console.log("liste des sattistique pour les rapport")),
        catchError(
          this.errorHandlerService.handleError<any[]>("fetchAll", [])
        )
      );
  }
}
