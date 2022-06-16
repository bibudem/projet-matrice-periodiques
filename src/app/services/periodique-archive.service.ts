import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from "rxjs";
import { catchError, tap } from "rxjs/operators";

import { ErrorHandlerService } from "./error-handler.service";

import { Archive } from "../models/Archive";

@Injectable({
  providedIn: "root",
})
export class PeriodiqueArchiveService {
  [x: string]: any;
  private url = "/api/archive";

  httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private http: HttpClient
  ) {}


  post(archive: Archive): Observable<any> {
    console.log(this.url+'/add');
    return this.http
      .post<Partial<Archive>>(this.url+'/add', archive, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("post")));
  }

  update(archive: Archive): Observable<any> {
    console.log(archive);
    return this.http
      .put<Partial<Archive>>(this.url+'/save', archive, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("update")));
  }

  delete(id: number): Observable<any> {
    const url = `/api/archive/delete/${id}`;

    return this.http
      .delete<Archive>(url, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("delete")));
  }
  //chercher toute la liste des archives
  fetchAll(idRevue: number): Observable<Archive[]> {
    return this.http
      .get<Archive[]>(this.url+'/all/'+idRevue, { responseType: "json" })
      .pipe(
        tap((_) => console.log("liste archives pour une periodique")),
        catchError(
          this.errorHandlerService.handleError<Archive[]>("fetchAll", [])
        )
      );
  }
  //consulter les données d'une archive
  consulter(id: number): Observable<any> {
    const url = `/api/archive/fiche/${id}`;
    return this.http
      .get<Archive>(url, { responseType: "json" })
      .pipe(catchError(this.errorHandlerService.handleError<any>("consulter")));

  }

}
