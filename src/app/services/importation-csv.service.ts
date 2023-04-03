import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import { Injectable, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { ErrorHandlerService } from "./error-handler.service";
import { InCites } from "../models/InCites";
import {statistiqueExcel} from "../models/statistiqueExcel";

@Injectable({
  providedIn: "root",
})
export class ImportationCsvService {
  [x: string]: any;
  private url = "/api/import-csv";

  // directive necessaire pour pouvoir lire l'url
  httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private http: HttpClient
  ) {}

  ngOnInit() {}

  post(csvImport: any): Observable<any> {
    return this.http
      .post<Partial<any>>(this.url+'/add', csvImport, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("post")));
  }

  updateStatistique(annee: string): Observable<any> {
    return this.http
      .get<any[]>(this.url+`/update/${annee}`, { responseType: "json" })
      .pipe(
        tap((_) => console.log("inCites update statistique")),
        catchError(
          this.errorHandlerService.handleError<any[]>("fetchAll", [])
        )
      );
  }

  postExcelStatistique(excelImport: any): Observable<any> {

    return this.http
      .post<Partial<statistiqueExcel>>(this.url+'/save-statistique', excelImport, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("update")));
  }

  updateStatistiqueExcelImport(annee: string): Observable<any> {
    //console.log(annee)
    return this.http
      .get<any[]>(`/api/import-csv/statistique/${annee}`, { responseType: "json" })
      .pipe(
        tap((_) => console.log("inCites update statistique")),
        catchError(
          this.errorHandlerService.handleError<any[]>("fetchAll", [])
        )
      );
  }

}
