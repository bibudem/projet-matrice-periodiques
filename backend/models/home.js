const db = require('../util/database');
const SqlString = require('sqlstring');
const datetime = require('node-datetime');

module.exports = class Logs {
  static async fetchCountBoard() {
    const dt = datetime.create();
    const annee = dt.format('Y') - 1;

    const sql = `
      SELECT COUNT(idRevue) AS count
      FROM tbl_periodiques
      UNION ALL
      SELECT SUM(Total_Item_Requests) AS count
      FROM tbl_statistiques
      WHERE annee = ?
      UNION ALL
      SELECT SUM(citations) AS count
      FROM tbl_statistiques
      WHERE annee = ?
      UNION ALL
      SELECT SUM(articlesUdem) AS count
      FROM tbl_statistiques
      WHERE annee = ?
    `;

    return db.execute(sql, [annee, annee, annee]);
  }

  static async getGraphiqueDonnees() {
    const dt = datetime.create();
    const annee = dt.format('Y') - 1;

    const sql = `
      SELECT titre, Total_Item_Requests, Unique_Item_Requests, No_License
      FROM tbl_statistiques
      INNER JOIN tbl_periodiques
      ON tbl_statistiques.idRevue = tbl_periodiques.idRevue
      WHERE annee = ?
      ORDER BY CAST(Total_Item_Requests AS UNSIGNED) DESC,
               CAST(citations AS UNSIGNED) DESC,
               CAST(articlesUdem AS UNSIGNED) DESC
      LIMIT 10
    `;

    return db.execute(sql, [annee]);
  }
};
