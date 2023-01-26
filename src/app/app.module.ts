import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from "./app.component";

//Import material diseigner
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatToolbarModule } from "@angular/material/toolbar";
// import pour multiselect
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {HttpClient, HttpClientModule} from '@angular/common/http';
//import pour traduction
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { MenuComponent } from './menu/menu.component';
import { AccueilComponent } from './components/accueil/accueil.component';
import { PeriodiqueListeComponent } from './components/periodique/periodique-liste/periodique-liste.component';
import { PeriodiqueFormulaireComponent } from './components/periodique/periodique-formulaire/periodique-formulaire.component';
import { PeriodiqueArchiveComponent } from './components/periodique/periodique-archive/periodique-archive.component';
import { PeriodiqueStatistiquesComponent } from './components/periodique/periodique-statistiques/periodique-statistiques.component';
import { PeriodiqueHistoriqueComponent } from './components/periodique/periodique-historique/periodique-historique.component';
import { PeriodiqueNoteComponent } from './components/periodique/periodique-note/periodique-note.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './components/login/login.component';
import { LoginRoutingModule } from './components/login/login-routing.module';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { AuthGuard } from "./services/auth-guard.service";
import {AdminGuard} from "./services/admin-guard.service";
import {MatTableModule} from "@angular/material/table";
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
registerLocaleData(localeFr, 'fr');
import { LOCALE_ID } from '@angular/core';
import { PeriodiquePrixComponent } from './components/periodique/periodique-prix/periodique-prix.component';
import { ListePlateformesComponent } from './components/outils/plateformes/liste-plateformes/liste-plateformes.component';
import { StatistiqueListeComponent } from './components/statistique-liste/statistique-liste.component';
import { PlateformeFormComponent } from './components/outils/plateformes/plateforme-form/plateforme-form.component';
import { ImportationSushiComponent } from './components/importation/importation-sushi/importation-sushi.component';
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import { ImportationInCitesComponent } from './components/importation/importation-inCites/importation-inCites.component';
import {ListBoxModule} from "@syncfusion/ej2-angular-dropdowns";
import { RapportPeriodiqueComponent } from './components/rapports/rapport-periodique/rapport-periodique.component';
import {DragDropModule} from "@angular/cdk/drag-drop";
import {MatDialogModule} from "@angular/material/dialog";
import {MatTableExporterModule} from "mat-table-exporter";
import { RapportStatistiqueComponent } from './components/rapports/rapport-statistique/rapport-statistique.component';
import { LogsRevueComponent } from './components/logs/logs-revue/logs-revue.component';
import { LogsPlateformeComponent } from './components/logs/logs-plateforme/logs-plateforme.component';
import { LogsMenuComponent } from './components/logs/logs-menu/logs-menu.component';
import {MatSelectModule} from "@angular/material/select";
import { ListFondsComponent } from './components/outils/fonds/list-fonds/list-fonds.component';
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {NotAutoriseComponent} from "./components/not-autorise/not-autorise.component";
// directive pour les masks
import { NgxMaskModule, IConfig } from 'ngx-mask';
import {NgApexchartsModule} from "ng-apexcharts";
import { RapportPlateformesComponent } from './components/rapports/rapport-plateformes/rapport-plateformes.component';
import {AboutComponent} from "./components/about/about.component";
import {NotUserComponent} from "./components/not-user/not-user.component";
import {MatSortModule} from "@angular/material/sort";
import { MiseAJourPrixComponent } from './components/processus/mise-a-jour-prix/mise-a-jour-prix.component';
import { MiseAJourAbonnementComponent } from './components/processus/mise-a-jour-abonnement/mise-a-jour-abonnement.component';
import { ListeProcessusComponent } from './components/processus/liste-processus/liste-processus.component';
import {MiseAJourStatistiquesComponent} from "./components/processus/mise-a-jour-statistiques/mise-a-jour-statistiques.component";
import {MiseEnLotPeriodiquesComponent} from "./components/processus/importation-en-lot-periodiques/importation-en-lot-periodiques.component";
import {ListeProcessusDelailsComponent} from "./components/processus/liste-processus-details/liste-processus-details.component";

const maskConfig: Partial<IConfig> = {
  validation: false,
};

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    MenuComponent,
    AccueilComponent,
    PeriodiqueListeComponent,
    PeriodiqueFormulaireComponent,
    PeriodiqueArchiveComponent,
    PeriodiqueStatistiquesComponent,
    PeriodiqueHistoriqueComponent,
    PeriodiqueNoteComponent,
    LoginComponent,
    PageNotFoundComponent,
    PeriodiquePrixComponent,
    ListePlateformesComponent,
    StatistiqueListeComponent,
    PlateformeFormComponent,
    ImportationSushiComponent,
    ImportationInCitesComponent,
    RapportPeriodiqueComponent,
    RapportStatistiqueComponent,
    LogsRevueComponent,
    LogsPlateformeComponent,
    LogsMenuComponent,
    ListFondsComponent,
    RapportPlateformesComponent,
    AboutComponent,
    NotUserComponent,
    NotAutoriseComponent,
    MiseAJourPrixComponent,
    MiseAJourStatistiquesComponent,
    MiseAJourAbonnementComponent,
    ListeProcessusComponent,
    MiseEnLotPeriodiquesComponent,
    ListeProcessusDelailsComponent
  ],
    imports: [
        BrowserModule,
        LoginRoutingModule,
        AppRoutingModule,
        NgSelectModule,
        FormsModule,
        // import HttpClientModule after BrowserModule.
        HttpClientModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        // directive pour les masks
        NgxMaskModule.forRoot(maskConfig),
        ReactiveFormsModule,
        BrowserAnimationsModule,
        HttpClientModule,
        NoopAnimationsModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatToolbarModule,
        MatTableModule,
        MatPaginatorModule,
        MatNativeDateModule,
        MatDatepickerModule,
        MatProgressBarModule,
        ListBoxModule,
        DragDropModule,
        MatDialogModule,
        MatTableExporterModule,
        MatSelectModule,
        MatAutocompleteModule,
        MatCheckboxModule,
        NgApexchartsModule,
        MatSortModule

    ],
  providers: [AuthGuard,AdminGuard,{ provide: LOCALE_ID, useValue: "fr-FR" }],
  bootstrap: [AppComponent]
})
export class AppModule { }

//fonction ajouté pour la traduction
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
