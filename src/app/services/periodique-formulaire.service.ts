import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from "rxjs";
import { catchError, tap } from "rxjs/operators";

import { ErrorHandlerService } from "./error-handler.service";

import { Periodique } from "../models/Periodique";


@Injectable({
  providedIn: "root",
})
export class PeriodiqueFormulaireService {
  [x: string]: any;
  private url = "/api/periodique";

  httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private http: HttpClient
  ) {}


  post(periodique: Periodique): Observable<any> {
    //console.log('service ok'+periodique.titrePost)
    return this.http
      .post<Partial<Periodique>>(this.url+'/add', periodique, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("post")));
  }

  update(periodique: Periodique): Observable<any> {
    //console.log(periodique)
    return this.http
      .put<Periodique>(this.url+'/save', periodique, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("update")));
  }

  delete(id: number): Observable<any> {
    const url = `/api/periodique/delete/${id}`;

    return this.http
      .delete<Periodique>(url, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("delete")));
  }
  consulter(id: number): Observable<any> {
    const url = `/api/periodique/fiche/${id}`;
    return this.http
      .get<Periodique>(url, { responseType: "json" })
      .pipe(catchError(this.errorHandlerService.handleError<any>("consulter")));

  }
  //ajout dans la liste de consultation
  postConsultation(periodique: any): Observable<any> {
    //console.log(periodique)
    return this.http
      .post<Partial<any>>(`/api/periodique/consulatation2022`, periodique, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("post")));
  }

}
