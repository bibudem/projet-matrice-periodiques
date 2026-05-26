import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { catchError } from "rxjs/operators";
@Injectable({
  providedIn: "root",
})
export class HomeService {
  private url = "/api/home";

  constructor(private http: HttpClient) {}

  getCount(annee: number): Observable<any> {
    const params = new HttpParams().set('annee', annee.toString());
    return this.http
      .get<any[]>(`${this.url}/count`, { params, responseType: "json" })
      .pipe(catchError(() => of([])));
  }

  getGraphiqueDonnees(annee: number): Observable<any> {
    const params = new HttpParams().set('annee', annee.toString());
    return this.http
      .get<any[]>(`${this.url}/graphique`, { params, responseType: "json" })
      .pipe(catchError(() => of([])));
  }
}
