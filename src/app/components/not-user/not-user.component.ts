import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

type RaisonErreur = 'acces-refuse' | 'echec-connexion';

@Component({
  selector: 'page-404',
  templateUrl: './not-user.component.html',
  styleUrls: ['./not-user.component.css']
})
export class NotUserComponent implements OnInit {

  /** Motif d'erreur transmis dans l'URL (?raison=...), null si simple déconnexion */
  raison: RaisonErreur | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.supprimerHistorique();
    const r = this.route.snapshot.queryParamMap.get('raison');
    this.raison = (r === 'acces-refuse' || r === 'echec-connexion') ? r : null;
  }

  // Vider les données de session côté navigateur
  supprimerHistorique(): void {
    localStorage.clear();
    sessionStorage.clear();
  }
}
