import { NgModule } from '@angular/core';
import {CanActivate, RouterModule, Routes} from '@angular/router';
import { AccueilComponent } from './components/accueil/accueil.component';
import { PeriodiqueListeComponent } from './components/periodique/periodique-liste/periodique-liste.component';
import { PeriodiqueFormulaireComponent } from './components/periodique/periodique-formulaire/periodique-formulaire.component';
import {PeriodiqueArchiveComponent} from "./components/periodique/periodique-archive/periodique-archive.component";
import {PeriodiqueStatistiquesComponent} from "./components/periodique/periodique-statistiques/periodique-statistiques.component";
import {PeriodiqueHistoriqueComponent} from "./components/periodique/periodique-historique/periodique-historique.component";
import {PeriodiqueNoteComponent} from "./components/periodique/periodique-note/periodique-note.component";
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { AuthGuard } from "./services/auth-guard.service";
import {PeriodiquePrixComponent} from "./components/periodique/periodique-prix/periodique-prix.component";
import {ListePlateformesComponent} from "./components/outils/plateformes/liste-plateformes/liste-plateformes.component";
import {PlateformeFormComponent} from "./components/outils/plateformes/plateforme-form/plateforme-form.component";
import {ImportationSushiComponent} from "./components/importation/importation-sushi/importation-sushi.component";
import {ImportationInCitesComponent} from "./components/importation/importation-inCites/importation-inCites.component";
import {StatistiqueListeComponent} from "./components/statistique-liste/statistique-liste.component";
import {RapportPeriodiqueComponent} from "./components/rapports/rapport-periodique/rapport-periodique.component";
import {RapportStatistiqueComponent} from "./components/rapports/rapport-statistique/rapport-statistique.component";
import {LogsMenuComponent} from "./components/logs/logs-menu/logs-menu.component";
import {LogsRevueComponent} from "./components/logs/logs-revue/logs-revue.component";
import {LogsPlateformeComponent} from "./components/logs/logs-plateforme/logs-plateforme.component";
import {ListFondsComponent} from "./components/outils/fonds/list-fonds/list-fonds.component";
import {RapportPlateformesComponent} from "./components/rapports/rapport-plateformes/rapport-plateformes.component";
import {AboutComponent} from "./components/about/about.component";
import {LoginComponent} from "./components/login/login.component";
import {NotUserComponent} from "./components/not-user/not-user.component";
import {AdminGuard} from "./services/admin-guard.service";
import {NotAutoriseComponent} from "./components/not-autorise/not-autorise.component";
import {ListeProcessusComponent} from "./components/processus/liste-processus/liste-processus.component";
import {MiseAJourPrixComponent} from "./components/processus/mise-a-jour-prix/mise-a-jour-prix.component";
import {MiseAJourAbonnementComponent} from "./components/processus/mise-a-jour-abonnement/mise-a-jour-abonnement.component";
import {MiseAJourStatistiquesComponent} from "./components/processus/mise-a-jour-statistiques/mise-a-jour-statistiques.component";
import {MiseEnLotPeriodiquesComponent} from "./components/processus/importation-en-lot-periodiques/importation-en-lot-periodiques.component";
import {ListeProcessusDelailsComponent} from "./components/processus/liste-processus-details/liste-processus-details.component";
import {MiseAJourArchivesComponent} from "./components/processus/mise-a-jour-archives/mise-a-jour-archives.component";
import {RapportMoyenneComponent} from "./components/rapports/rapport-moyenne/rapport-moyenne.component";

const routes: Routes = [
  { path: '', component: AccueilComponent, canActivate: [AuthGuard] },
  { path: 'accueil', component: AccueilComponent, canActivate: [AuthGuard] },
  { path: 'periodique/liste', component: PeriodiqueListeComponent, canActivate: [AuthGuard] },
  { path: 'periodique/add', component: PeriodiqueFormulaireComponent, canActivate: [AuthGuard,AdminGuard] },
  { path: 'periodique/:id', component: PeriodiqueFormulaireComponent, canActivate: [AuthGuard] },
  { path: 'periodique/archive/:id', component: PeriodiqueArchiveComponent, canActivate: [AuthGuard,AdminGuard] },
  { path: 'periodique/statistiques/:id', component: PeriodiqueStatistiquesComponent, canActivate: [AuthGuard,AdminGuard] },
  { path: 'periodique/statistiques/:id/:return', component: PeriodiqueStatistiquesComponent, canActivate: [AuthGuard] },
  { path: 'periodique/historique/:id', component: PeriodiqueHistoriqueComponent, canActivate: [AuthGuard,AdminGuard] },
  { path: 'periodique/note/:id', component: PeriodiqueNoteComponent, canActivate: [AuthGuard,AdminGuard] },
  { path: 'periodique/prix/:id', component: PeriodiquePrixComponent, canActivate: [AuthGuard,AdminGuard] },
  { path: 'plateformes', component: ListePlateformesComponent, canActivate: [AuthGuard,AdminGuard] },
  { path: 'plateforme-form', component: PlateformeFormComponent, canActivate: [AuthGuard,AdminGuard] },
  { path: 'importation-sushi', component: ImportationSushiComponent, canActivate: [AuthGuard,AdminGuard] },
  { path: 'mise-a-jour-periodiques', component: MiseEnLotPeriodiquesComponent, canActivate: [AuthGuard,AdminGuard] },
  { path: 'importation-inCites', component: ImportationInCitesComponent, canActivate: [AuthGuard,AdminGuard] },
  { path: 'liste-statistique', component: StatistiqueListeComponent, canActivate: [AuthGuard] },
  { path: 'liste-statistique/:annee', component: StatistiqueListeComponent, canActivate: [AuthGuard] },
  { path: 'rapport-periodique', component: RapportPeriodiqueComponent, canActivate: [AuthGuard] },
  { path: 'rapport-statistique', component: RapportStatistiqueComponent, canActivate: [AuthGuard] },
  { path: 'rapport-moyenne', component: RapportMoyenneComponent, canActivate: [AuthGuard] },
  { path: 'rapport-plateforme', component: RapportPlateformesComponent, canActivate: [AuthGuard] },
  { path: 'logs-menu', component: LogsMenuComponent, canActivate: [AuthGuard,AdminGuard] },
  { path: 'logs-revue', component: LogsRevueComponent, canActivate: [AuthGuard,AdminGuard] },
  { path: 'logs-plateforme', component: LogsPlateformeComponent, canActivate: [AuthGuard,AdminGuard] },
  { path: 'processus', component: ListeProcessusComponent, canActivate: [AuthGuard,AdminGuard] },
  { path: 'processus/add', component: ListeProcessusComponent, canActivate: [AuthGuard,AdminGuard] },
  { path: 'processus/details/:id', component: ListeProcessusDelailsComponent, canActivate: [AuthGuard,AdminGuard] },
  { path: 'mise-a-jour-prix', component: MiseAJourPrixComponent, canActivate: [AuthGuard,AdminGuard] },
  { path: 'mise-a-jour-archives', component: MiseAJourArchivesComponent, canActivate: [AuthGuard,AdminGuard] },
  { path: 'mise-a-jour-statistiques', component: MiseAJourStatistiquesComponent, canActivate: [AuthGuard,AdminGuard] },
  { path: 'mise-a-jour-abonnement', component: MiseAJourAbonnementComponent, canActivate: [AuthGuard,AdminGuard] },
  { path: 'list-fonds', component: ListFondsComponent, canActivate: [AuthGuard,AdminGuard] },
  { path: 'about', component: AboutComponent, canActivate: [AuthGuard] },
  { path: 'page-not-found', component: PageNotFoundComponent, canActivate: [AuthGuard]  },
  { path: 'not-user', component: NotUserComponent },
  { path: 'not-acces', component: NotAutoriseComponent, canActivate: [AuthGuard] },
  { path: '**', component: PageNotFoundComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
