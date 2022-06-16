import { Component, OnInit } from '@angular/core';
import {LogsListeServiceService} from "../../../services/logs-liste.service";
import {Observable} from "rxjs";

@Component({
  selector: 'app-logs-menu',
  templateUrl: './logs-menu.component.html',
  styleUrls: ['./logs-menu.component.css']
})
export class LogsMenuComponent implements OnInit {

  totalLogsRevue=0
  totalLogsPlat=0


  counts$: Observable<any> | undefined;

  constructor(private logsService: LogsListeServiceService) { }

  ngOnInit(): void {
    //charger les données
    this.getCount()
  }

  async getCount() {
    try {
      this.counts$ = this.logsService.getCount();
      // @ts-ignore
      await this.counts$.toPromise().then(res => {
        console.log(res)
        this.totalLogsRevue=res.totalLogsRevue
        this.totalLogsPlat=res.totalLogsPlat
      });
    } catch(err) {
      console.error(`Error : ${err.Message}`);
    }
  }
}
