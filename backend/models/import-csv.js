const db = require('../util/database');
const datetime = require('node-datetime');

module.exports = class InCites {

  // Support both object {annee, Name, ...} and legacy array [_, annee, Name, ...]
  static async post(record) {
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

    const existing = await db.execute(
      "SELECT id_incites AS id FROM tbl_incites WHERE (Name=? OR ISSN=? OR EISSN=?) AND annee=? LIMIT 0,1",
      [Name, ISSN, EISSN, annee]
    );

    if (existing[0].length > 0) {
      const id = existing[0][0].id;
      tabValue.push(id);
      await db.execute('UPDATE tbl_incites SET ' + condSql + ' ,dateM=? WHERE id_incites=?', tabValue);
    } else {
      tabValue.push(0);
      await db.execute('INSERT INTO tbl_incites SET ' + condSql + ' ,dateA=?, id_incites=?', tabValue);
    }
    return 1;
  }

  static async postBulk(records) {
    let count = 0;
    for (const record of records) {
      if (record.Name === '-') continue;
      count += await InCites.post(record);
    }
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

    for (const d of donnees[0]) {
      if (!d.Name) continue;

      const tabValue = [];
      let condSql = '';
      if (d.ArticlesUdeM) { condSql += ', ArticlesUdeM = ?'; tabValue.push(d.ArticlesUdeM); }
      if (d.Citations)    { condSql += ', Citations = ?';    tabValue.push(d.Citations); }
      // skip this record if nothing to update (was `return []` — would wrongly stop entire loop)
      if (!condSql) continue;

      condSql = condSql.slice(1);
      tabValue.push(date);

      const ISSN  = d.ISSN  || '';
      const EISSN = d.EISSN || '';

      const idRevue = await InCites.recouperationIdRevue(ISSN, EISSN, d.Name, annee);
      if (idRevue <= 0) continue;

      count++;
      const action = await db.execute(
        "SELECT idRevue FROM tbl_statistiques WHERE idRevue=? AND annee=?",
        [idRevue, annee]
      );

      if (action[0].length > 0) {
        tabValue.push(idRevue);
        tabValue.push(annee);
        await db.execute(
          "UPDATE tbl_statistiques SET " + condSql + " ,dateM=? WHERE idRevue=? AND annee=?",
          tabValue
        );
      } else {
        tabValue.push(0);
        tabValue.push(annee);
        await db.execute(
          "INSERT INTO tbl_statistiques SET " + condSql + " ,dateA=?,idRevue=?,annee=?",
          tabValue
        );
      }
    }

    console.log(count);
    return [count];
  }

  static async recouperationIdRevue(ISSN, EISSN, Title, annee) {
    let idRevue = -1;
    const id = await db.execute(
      "SELECT idRevue FROM tbl_periodiques WHERE (ISSN=? OR EISSN=?) OR (ISSN=? OR EISSN=?) ORDER BY idRevue LIMIT 0,1",
      [ISSN, EISSN, EISSN, ISSN]
    );
    if (id[0].length > 0) {
      idRevue = id[0][0].idRevue;
    } else {
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
