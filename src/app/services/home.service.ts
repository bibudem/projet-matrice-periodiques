import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";

import { ErrorHandlerService } from "./error-handler.service";

@Injectable({
  providedIn: "root",
})
export class HomeService {
  private url = "/api/home";

  httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private http: HttpClient
  ) {}

  // Optimized getCount method with better error handling
  getCount(): Observable<any> {
    return this.http
      .get<any[]>(`${this.url}/count`, { responseType: "json" })
      .pipe(
        catchError((error) => {
          this.errorHandlerService.handleError("getCount", error);
          return of([]); // Return empty array in case of error
        })
      );
  }

  // Optimized getGraphiqueDonnees method
  getGraphiqueDonnees(): Observable<any> {
    return this.http
      .get<any[]>(`${this.url}/graphique`, { responseType: "json" })
      .pipe(
        catchError((error) => {
          this.errorHandlerService.handleError("getGraphiqueDonnees", error);
          return of([]); // Return empty array in case of error
        })
      );
  }
}
