import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from "rxjs";
import { catchError, tap } from "rxjs/operators";

import { ErrorHandlerService } from "./error-handler.service";

import {ListeStatistique} from "../models/ListeStatistique";

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

  //chercher toute la liste des statistiques
  rapportStatistiques(annees:any,plateforme:string): Observable<any[]> {
    let params,paramAnnees='';
    if(annees!=''){
      params=new HttpParams()
      for(let i=0;i<annees.length;i++){
        paramAnnees+=annees[i]+'='
      }
      if(plateforme!=''){
        paramAnnees+='&'+plateforme;
      }
      params=new HttpParams().set('periode', paramAnnees);
    }

    console.log(paramAnnees);
    console.log('/api/liste-statistique/rapport/'+params);
    return this.http
      .get<any[]>(`/api/liste-statistique/rapport/${params}`, { responseType: "json" })
      .pipe(
        tap((_) => console.log("rapport statistiques")),
        catchError(
          this.errorHandlerService.handleError<any[]>("rapportStatistiques", [])
        )
      );
  }

}
