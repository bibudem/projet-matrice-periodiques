const db = require('../util/database');
const datetime = require('node-datetime');

module.exports = class InCites {

  // Support both object {annee, Name, ...} and legacy array [_, annee, Name, ...]
  static async post(record, cache) {
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');
    const tabValue = [];
    let condSql = '';

    const annee        = Array.isArray(record) ? record[1] : record.annee;
    const Name         = Array.isArray(record) ? record[2] : record.Name;
    const ArticlesUdeM = Array.isArray(record) ? record[3] : record.ArticlesUdeM;
    const Citations    = Array.isArray(record) ? record[4] : record.Citations;
    const ISSN         = Array.isArray(record) ? record[5] : record.ISSN;
    const EISSN        = Array.isArray(record) ? record[6] : record.EISSN;

    if (annee        && annee !== '-')        { condSql += ', annee = ?';        tabValue.push(annee); }
    if (Name         && Name !== '-')         { condSql += ', Name = ?';         tabValue.push(Name); }
    if (ArticlesUdeM && ArticlesUdeM !== '-') { condSql += ', ArticlesUdeM = ?'; tabValue.push(ArticlesUdeM); }
    if (Citations    && Citations !== '-')    { condSql += ', Citations = ?';     tabValue.push(Citations); }
    if (ISSN         && ISSN !== '-')         { condSql += ', ISSN = ?';         tabValue.push(ISSN); }
    if (EISSN        && EISSN !== '-')        { condSql += ', EISSN = ?';        tabValue.push(EISSN); }

    if (!condSql) return 0;
    condSql = condSql.slice(1);
    tabValue.push(date);

    // meme ordre de priorite Name > ISSN > EISSN que la recherche ci-dessous,
    // pour que deux lignes visant la meme cle soient bien serialisees par le lock
    const matchKey = (Name && Name !== '-') ? Name : (ISSN && ISSN !== '-') ? ISSN : (EISSN && EISSN !== '-') ? EISSN : '';

    return await InCites.withLock(cache, `incites|${annee}|${matchKey}`, async () => {
      let id;
      if (cache) {
        id = (Name && cache.byKey.get(Name)) ?? (ISSN && cache.byKey.get(ISSN)) ?? (EISSN && cache.byKey.get(EISSN));
      } else {
        const existing = await db.execute(
          "SELECT id_incites AS id FROM tbl_incites WHERE (Name=? OR ISSN=? OR EISSN=?) AND annee=? LIMIT 0,1",
          [Name, ISSN, EISSN, annee]
        );
        if (existing[0].length > 0) id = existing[0][0].id;
      }

      if (id !== undefined && id !== null) {
        tabValue.push(id);
        await db.execute('UPDATE tbl_incites SET ' + condSql + ' ,dateM=? WHERE id_incites=?', tabValue);
      } else {
        tabValue.push(0);
        const [result] = await db.execute('INSERT INTO tbl_incites SET ' + condSql + ' ,dateA=?, id_incites=?', tabValue);
        if (cache) {
          const newId = result.insertId;
          if (Name && !cache.byKey.has(Name)) cache.byKey.set(Name, newId);
          if (ISSN && !cache.byKey.has(ISSN)) cache.byKey.set(ISSN, newId);
          if (EISSN && !cache.byKey.has(EISSN)) cache.byKey.set(EISSN, newId);
        }
      }
      return 1;
    });
  }

  // Construit un cache de lot pour un import bulk : les lignes d'un meme fichier partagent
  // toutes la meme annee (choisie une fois dans le select), donc un seul preload suffit.
  static async buildBatchCache(annee) {
    const [rows] = await db.execute(
      "SELECT id_incites, Name, ISSN, EISSN FROM tbl_incites WHERE annee=?",
      [annee]
    );
    const byKey = new Map();
    for (const row of rows) {
      if (row.Name && !byKey.has(row.Name)) byKey.set(row.Name, row.id_incites);
      if (row.ISSN && !byKey.has(row.ISSN)) byKey.set(row.ISSN, row.id_incites);
      if (row.EISSN && !byKey.has(row.EISSN)) byKey.set(row.EISSN, row.id_incites);
    }
    return { byKey, locks: new Map() };
  }

  // Meme helper que backend/models/processus.js : serialise les appels partageant la meme cle
  // (ex: meme Name/ISSN/EISSN) pour eviter qu'un traitement concurrent cree un doublon.
  static async withLock(cache, key, fn) {
    if (!cache) return fn();
    const previous = cache.locks.get(key) || Promise.resolve();
    let release;
    const current = new Promise(resolve => { release = resolve; });
    cache.locks.set(key, previous.then(() => current));
    await previous;
    try {
      return await fn();
    } finally {
      release();
    }
  }

  // Meme helper que backend/models/processus.js : concurrence bornee au lieu d'un for...of sequentiel.
  static async runBatched(items, concurrency, fn) {
    const results = new Array(items.length);
    let index = 0;
    async function worker() {
      while (index < items.length) {
        const current = index++;
        results[current] = await fn(items[current], current);
      }
    }
    const workers = Array.from({length: Math.min(concurrency, items.length)}, () => worker());
    await Promise.all(workers);
    return results;
  }

  static async postBulk(records) {
    const toProcess = records.filter(record => record.Name !== '-');
    const cache = toProcess.length > 0 ? await InCites.buildBatchCache(toProcess[0].annee) : undefined;
    const counts = await InCites.runBatched(toProcess, 15, record => InCites.post(record, cache));
    const count = counts.reduce((sum, c) => sum + c, 0);
    return [count];
  }

  static async update(annee) {
    let dt = datetime.create();
    let date = dt.format('Y-m-d H:M:S');
    let count = 0;

    const donnees = await db.execute(
      "SELECT ISSN, EISSN, Name, ArticlesUdeM, Citations FROM tbl_incites WHERE annee=?",
      [annee]
    );

    const cache = await InCites.buildPeriodiquesCache();

    await InCites.runBatched(donnees[0], 15, async (d) => {
      if (!d.Name) return;

      const tabValue = [];
      let condSql = '';
      if (d.ArticlesUdeM) { condSql += ', ArticlesUdeM = ?'; tabValue.push(d.ArticlesUdeM); }
      if (d.Citations)    { condSql += ', Citations = ?';    tabValue.push(d.Citations); }
      // skip this record if nothing to update (was `return []` — would wrongly stop entire loop)
      if (!condSql) return;

      condSql = condSql.slice(1);
      tabValue.push(date);

      const ISSN  = d.ISSN  || '';
      const EISSN = d.EISSN || '';

      const idRevue = await InCites.recouperationIdRevue(ISSN, EISSN, d.Name, annee, cache);
      if (idRevue <= 0) return;

      count++;

      await InCites.withLock(cache, `stats|${idRevue}|${annee}`, async () => {
        const action = await db.execute(
          "SELECT idRevue FROM tbl_statistiques WHERE idRevue=? AND annee=?",
          [idRevue, annee]
        );

        if (action[0].length > 0) {
          const values = [...tabValue, idRevue, annee];
          await db.execute(
            "UPDATE tbl_statistiques SET " + condSql + " ,dateM=? WHERE idRevue=? AND annee=?",
            values
          );
        } else {
          const values = [...tabValue, 0, annee];
          await db.execute(
            "INSERT INTO tbl_statistiques SET " + condSql + " ,dateA=?,idRevue=?,annee=?",
            values
          );
        }
      });
    });

    console.log(count);
    return [count];
  }

  // Preload de tbl_periodiques pour recouperationIdRevue — evite un SELECT par ligne de tbl_incites.
  static async buildPeriodiquesCache() {
    const [rows] = await db.execute("SELECT idRevue, ISSN, EISSN FROM tbl_periodiques");
    const issnEissnToId = new Map();
    for (const row of rows) {
      if (row.ISSN && !issnEissnToId.has(row.ISSN)) issnEissnToId.set(row.ISSN, row.idRevue);
      if (row.EISSN && !issnEissnToId.has(row.EISSN)) issnEissnToId.set(row.EISSN, row.idRevue);
    }
    return { issnEissnToId, locks: new Map() };
  }

  static async recouperationIdRevue(ISSN, EISSN, Title, annee, cache) {
    let idRevue = -1;
    if (cache) {
      idRevue = cache.issnEissnToId.get(ISSN) ?? cache.issnEissnToId.get(EISSN) ?? -1;
    } else {
      const id = await db.execute(
        "SELECT idRevue FROM tbl_periodiques WHERE (ISSN=? OR EISSN=?) OR (ISSN=? OR EISSN=?) ORDER BY idRevue LIMIT 0,1",
        [ISSN, EISSN, EISSN, ISSN]
      );
      if (id[0].length > 0) idRevue = id[0][0].idRevue;
    }

    if (idRevue === -1) {
      let dt = datetime.create();
      let dateNow = dt.format('Y-m-d H:M:S');
      const existing = await db.execute(
        "SELECT id_log FROM lst_logsrevues WHERE Title LIKE ? AND annee=? AND ISSN=? AND EISSN=?",
        [Title, annee, ISSN, EISSN]
      );
      if (existing[0].length === 0) {
        await db.execute(
          "INSERT INTO lst_logsrevues SET ISSN=?,EISSN=?,Title=?,rapport=?,annee=?,note=?,dateA=?",
          [ISSN, EISSN, Title, 'inCites', annee, 'Périodique non-trouvé rapport', dateNow]
        );
      }
    }
    return idRevue;
  }
};
