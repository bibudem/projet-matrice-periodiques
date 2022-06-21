import { Component, OnInit } from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {MethodesGlobal} from "../lib/MethodesGlobal";
import {Router} from "@angular/router";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  ifAdmin=false

  //importer les fonctions global
  methodesGlobal: MethodesGlobal = new MethodesGlobal();


  //routActive='';

  constructor(private translate: TranslateService,
              private router:Router) { }

  ngOnInit(): void {
    //ajout de niveau de securité
    this.ifAdmin=this.methodesGlobal.ifAdminFunction()

  }

}
