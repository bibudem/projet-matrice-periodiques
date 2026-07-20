import { HttpParams } from "@angular/common/http";

// Construit des HttpParams a partir d'un objet de filtres {colonne: 'valeur'} (les
// mat-select multiple stockent une liste jointe par virgule dans la meme cle) et
// d'eventuels parametres additionnels (ex: annees, plateforme principale).
// Remplace l'ancien pattern fragile qui interpolait les filtres dans un segment
// d'URL (ex: `/rapport-all/${params}`) au lieu de vraies query params.
export function buildFiltresParams(filtres: any, extra?: { [key: string]: string }): HttpParams {
  let params = new HttpParams();
  if (filtres) {
    Object.keys(filtres).forEach(key => {
      const val = filtres[key];
      if (val !== undefined && val !== null && val !== '') {
        params = params.set(key, val.toString());
      }
    });
  }
  if (extra) {
    Object.keys(extra).forEach(key => {
      const val = extra[key];
      if (val !== undefined && val !== null && val !== '') {
        params = params.set(key, val);
      }
    });
  }
  return params;
}
