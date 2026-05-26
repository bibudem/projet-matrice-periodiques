const db = require('../util/database');

module.exports = class Home {
  static fetchCountBoard(annee) {
    const sql = `
      SELECT COUNT(idRevue) AS count
      FROM tbl_periodiques
      UNION ALL
      SELECT COALESCE(SUM(Total_Item_Requests), 0) AS count
      FROM tbl_statistiques
      WHERE annee = ?
      UNION ALL
      SELECT COALESCE(SUM(citations), 0) AS count
      FROM tbl_statistiques
      WHERE annee = ?
      UNION ALL
      SELECT COALESCE(SUM(articlesUdem), 0) AS count
      FROM tbl_statistiques
      WHERE annee = ?
    `;
    return db.execute(sql, [annee, annee, annee]);
  }

  static getGraphiqueDonnees(annee) {
    const sql = `
      SELECT titre, Total_Item_Requests, Unique_Item_Requests, No_License
      FROM tbl_statistiques
      INNER JOIN tbl_periodiques ON tbl_statistiques.idRevue = tbl_periodiques.idRevue
      WHERE annee = ?
      ORDER BY CAST(Total_Item_Requests AS UNSIGNED) DESC
      LIMIT 10
    `;
    return db.execute(sql, [annee]);
  }
};
