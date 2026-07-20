// Construction de clauses WHERE parametrees a partir d'un objet de filtres
// { colonne: 'valeur' } ou { colonne: 'valeur1,valeur2' } (mat-select multiple
// cote Angular joint les valeurs selectionnees par une virgule). Une liste
// blanche de colonnes est toujours exigee : les valeurs sont parametrees (?),
// mais les NOMS de colonnes ne peuvent jamais venir directement du client.

function splitValues(raw) {
  if (Array.isArray(raw)) return raw.map(v => v.toString().trim()).filter(v => v !== '');
  return raw.toString().split(',').map(v => v.trim()).filter(v => v !== '');
}

function isEmptyFilter(raw) {
  return raw === undefined || raw === null || raw === '' || raw === 'vide';
}

// "?,?,?" — un placeholder par valeur. db.execute() (requetes preparees,
// protocole binaire) ne supporte pas un tableau JS comme UN SEUL parametre
// pour IN (?) sur certaines versions de MySQL/MariaDB (erreur "This version
// of MySQL doesn't yet support 'item type for JSON'") — contrairement a
// db.query() (protocole texte) qui accepte cette expansion automatique.
// Il faut donc toujours generer explicitement un placeholder par valeur.
function placeholders(count) {
  return Array(count).fill('?').join(',');
}

// AND col IN (?,?,...) pour chaque colonne de allowedColumns presente dans
// filtres (correspondance exacte — utiliser pour les champs a valeur unique
// par ligne).
function buildExactFilters(filtres, allowedColumns) {
  let clause = '';
  const params = [];
  for (const col of allowedColumns) {
    const raw = filtres ? filtres[col] : undefined;
    if (isEmptyFilter(raw)) continue;
    const values = splitValues(raw);
    if (values.length === 0) continue;
    clause += ` AND \`${col}\` IN (${placeholders(values.length)})`;
    params.push(...values);
  }
  return { clause, params };
}

// AND (col LIKE ? OR col LIKE ? ...) pour chaque colonne de allowedColumns
// presente dans filtres — utiliser pour les champs qui stockent une liste
// denormalisee dans une seule cellule (ex: autrePlateforme = "5,12,7"),
// ou une correspondance exacte ne suffit pas.
function buildLikeFilters(filtres, allowedColumns) {
  let clause = '';
  const params = [];
  for (const col of allowedColumns) {
    const raw = filtres ? filtres[col] : undefined;
    if (isEmptyFilter(raw)) continue;
    const values = splitValues(raw);
    if (values.length === 0) continue;
    const ors = values.map(() => `\`${col}\` LIKE ?`).join(' OR ');
    clause += ` AND (${ors})`;
    params.push(...values.map(v => `%${v}%`));
  }
  return { clause, params };
}

// Fusionne plusieurs { clause, params } dans l'ordre, et transforme le tout
// premier "AND" en "WHERE" si aucune clause WHERE n'existe deja dans la requete.
function combine(...parts) {
  let clause = parts.map(p => p.clause).join('');
  const params = parts.reduce((acc, p) => acc.concat(p.params), []);
  return { clause, params };
}

function asWhere(combined) {
  return combined.clause.replace(/^ AND/, ' WHERE');
}

module.exports = { buildExactFilters, buildLikeFilters, combine, asWhere, placeholders };
