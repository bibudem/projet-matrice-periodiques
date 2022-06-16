import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Injectable, OnInit} from "@angular/core";

import { Observable } from "rxjs";
import { catchError, tap } from "rxjs/operators";

import { ErrorHandlerService } from "./error-handler.service";

import { Periodique } from "../models/Periodique";
import {NavigationEnd, Router} from "@angular/router";


@Injectable({
  providedIn: "root",
})
export class PeriodiqueListeService implements OnInit {
  private url = "/api/periodique";

  httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };
  private modalService: any;

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private http: HttpClient,private router: Router
  ) {}

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // close all open modals
        this.modalService.dismissAll();
      }
    });
  }
//chercher toute la liste
  fetchAll(): Observable<Periodique[]> {
    return this.http
      .get<Periodique[]>(this.url+'/all', { responseType: "json" })
      .pipe(
        tap((_) => console.log("fetched periodiques")),
        catchError(
          this.errorHandlerService.handleError<Periodique[]>("fetchAll", [])
        )
      );
  }
  //chercher toute la liste
  fetchRapportAll(plateforme:string): Observable<any[]> {
    if(plateforme=='')
      plateforme='vide'

    let params=new HttpParams().set('plateforme', plateforme)
     console.log(`/api/periodique/rapport-all/${params}`)
    return this.http
      .get<any[]>(`/api/periodique/rapport-all/${params}`, { responseType: "json" })
      .pipe(
        tap((_) => console.log("fetched periodiques raport")),
        catchError(
          this.errorHandlerService.handleError<any[]>("fetchRapportAll", [])
        )
      );
  }
  //chercher toute la liste
  fetchRapportFiltre(filtres:any): Observable<any[]> {
    let result = Object.entries(filtres);
    // console.log(typeof(result))
    for(let [key,f] of result){
      console.log(key)
    }
    let params = new HttpParams()



    return this.http
      .get<any[]>(this.url+`/rapport-filtre/${params}`, { responseType: "json" })
      .pipe(
        tap((_) => console.log("fetched periodiques raport")),
        catchError(
          this.errorHandlerService.handleError<any[]>("fetchRapportAll", [])
        )
      );
  }
  //supprimer une fiche
  delete(id: number): Observable<any> {
    const url = `/api/periodique/delete/${id}`;
    return this.http
      .delete<Periodique>(url, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("delete")));
  }

}
