const mysql = require('mysql2');

const config = require('../config/config.json');

const pool = mysql.createPool({
  host: config.host,
  user: config.user,
  database: config.database,
  password: config.password,
  charset: 'utf8mb4',
  // mysql2 default is 10 — les imports en lot lancent jusqu'a 15 lignes en parallele
  // (Processus.runBatched/InCites.runBatched), donc un pool plus petit les ferait
  // simplement attendre une connexion libre au lieu d'apporter un vrai gain de vitesse.
  connectionLimit: 20,
});

module.exports = pool.promise();
