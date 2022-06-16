import {Component, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {HomeService} from "../../services/home.service";

@Component({
  selector: 'page-404',
  templateUrl: './not-user.component.html',
  styleUrls: ['./not-user.component.css']
})
export class NotUserComponent implements OnInit{

  constructor(private translate:TranslateService) {

  }
  async ngOnInit() {
    await this.supprimerHistorique()
  }
  //fonction qui supprime tous les cookies
  async supprimerHistorique(){
    localStorage.clear();
    sessionStorage.clear()
  }
}
