import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from "rxjs";
import { catchError, tap } from "rxjs/operators";

import { ErrorHandlerService } from "./error-handler.service";

import { Note } from "../models/Note";

@Injectable({
  providedIn: "root",
})
export class PeriodiqueNotesService {
  [x: string]: any;
  private url = "/api/note";

  httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private http: HttpClient
  ) {}


  post(note: Note): Observable<any> {
    console.log(this.url+'/add');
    return this.http
      .post<Partial<Note>>(this.url+'/add', note, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("post")));
  }

  update(note: Note): Observable<any> {
    return this.http
      .put<Note>(this.url+'/save', note, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("update")));
  }

  delete(id: number): Observable<any> {
    const url = `/api/note/delete/${id}`;

    return this.http
      .delete<Note>(url, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("delete")));
  }
  //chercher toute la liste des archives
  fetchAll(idRevue: number): Observable<Note[]> {
    return this.http
      .get<Note[]>(this.url+'/all/'+idRevue, { responseType: "json" })
      .pipe(
        tap((_) => console.log("liste des notes pour une periodique")),
        catchError(
          this.errorHandlerService.handleError<Note[]>("fetchAll", [])
        )
      );
  }
  //consulter les données d'une archive
  consulter(id: number): Observable<any> {
    const url = `/api/note/fiche/${id}`;
    return this.http
      .get<Note>(url, { responseType: "json" })
      .pipe(catchError(this.errorHandlerService.handleError<any>("consulter")));
  }

}
