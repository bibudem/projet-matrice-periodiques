import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { ErrorHandlerService } from "./error-handler.service";
import { Prix } from "../models/Prix";

@Injectable({
  providedIn: "root",
})
export class PeriodiquePrixService {
  [x: string]: any;
  private url = "/api/prix";

  httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private http: HttpClient
  ) {}


  post(prix: Prix): Observable<any> {
    console.log(this.url+'/add');
    return this.http
      .post<Partial<Prix>>(this.url+'/add', prix, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("post")));
  }

  update(prix: Prix): Observable<any> {
    return this.http
      .put<Prix>(this.url+'/save', prix, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("update")));
  }

  delete(id: number): Observable<any> {
    const url = `/api/prix/delete/${id}`;

    return this.http
      .delete<Prix>(url, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("delete")));
  }
  //chercher toute la liste des archives
  fetchAll(idRevue: number): Observable<Prix[]> {
    return this.http
      .get<Prix[]>(this.url+'/all/'+idRevue, { responseType: "json" })
      .pipe(
        tap((_) => console.log("liste des prix pour une periodique")),
        catchError(
          this.errorHandlerService.handleError<Prix[]>("fetchAll", [])
        )
      );
  }
  //consulter les données d'une archive
  consulter(id: number): Observable<any> {
    const url = `/api/prix/fiche/${id}`;
    return this.http
      .get<Prix>(url, { responseType: "json" })
      .pipe(catchError(this.errorHandlerService.handleError<any>("consulter")));
  }

}
