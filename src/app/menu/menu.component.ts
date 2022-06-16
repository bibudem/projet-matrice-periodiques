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

  classeMenu :any = [];

  ifAdmin=false

  //importer les fonctions global
  methodesGlobal: MethodesGlobal = new MethodesGlobal();

  constructor(private translate: TranslateService,
              private router:Router) { }

  ngOnInit(): void {
     //ajout de niveau de securité
     this.ifAdmin=this.methodesGlobal.ifAdminFunction()
     //alert(this.ifAdmin)
     this.menuChampActivate()
  }

  //ajouter la classe active pour les menu
  menuChampActivate(){
    this.translate.get('routes').subscribe((res: any) => {
      let result = Object.entries(res);
      // console.log(typeof(result))
       this.classeMenu['rapport']='nav-item'
       this.classeMenu['statistique']='nav-item'
       this.classeMenu['outils']='nav-item'
       this.classeMenu['importation']='nav-item'
      for(let [key,val] of result){
        this.classeMenu[key]='nav-item'
        if (this.router.url.startsWith("/"+key)) {
          switch (key){
            case 'liste-statistique':
              this.classeMenu['statistique']+=' active'
              break
            case 'importation-sushi':
            case 'importation-inCites':
              this.classeMenu['importation']+=' active'
              break
            case 'rapport-periodique':
            case 'rapport-statistique':
            case 'rapport-plateforme':
              this.classeMenu['rapport']+=' active'
              break
            case 'plateformes':
            case 'list-fonds':
              this.classeMenu['outils']+=' active'
              break
            default :
              // @ts-ignore
              this.classeMenu[key]+=' active'
          }

        }

      }

      //console.log(this.menuTitre)
    });
  }

}
