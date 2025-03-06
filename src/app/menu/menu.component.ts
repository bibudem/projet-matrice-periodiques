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

  ifAdmin=false;
  openMenu: string | null = null;

  //importer les fonctions global
  methodesGlobal: MethodesGlobal = new MethodesGlobal();


  //routActive='';

  constructor(private translate: TranslateService,
              private router:Router) { }

  ngOnInit(): void {
    //ajout de niveau de securité
    this.ifAdmin=this.methodesGlobal.ifAdminFunction()

  }

  /**
   * Basculez l'état d'ouverture d'un menu
   */
  toggleMenu(menuName: string): void {
    this.openMenu = this.openMenu === menuName ? null : menuName;
  }

  /**
   * Vérifiez si une des routes correspond à la route active
   */
  isSubMenuActive(routes: string[]): boolean {
    return routes.some(route => this.router.url.startsWith(route));
  }

}
