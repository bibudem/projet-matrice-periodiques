import { Component } from '@angular/core';
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'not-autorise',
  templateUrl: './not-autorise.component.html',
  styleUrls: ['./not-autorise.component.css']
})
export class NotAutoriseComponent {

  constructor(
    private translate:TranslateService) {

  }

}
