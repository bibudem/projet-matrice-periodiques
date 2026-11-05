require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');

const bodyParser = require('body-parser');

const session = require('express-session')

const periodiqueRoutes = require('./routes/periodique');

const archiveRoutes = require('./routes/archive');

const historiqueRoutes = require('./routes/historique');

const noteRoutes = require('./routes/note');

const statistiqueRoutes = require('./routes/statistique');

const plateformeRoutes = require('./routes/plateforme');

const prixRoutes = require('./routes/prix');

const sushiRoutes = require('./routes/sushi');

const updateStatistiqueRoutes = require('./routes/update-statistique');

const listeStatistiqueRoutes = require('./routes/liste-statistique');

const userUdemRoutes = require('./routes/userUdem');


const importCsvRoutes= require('./routes/import-csv');

const logsRoutes= require('./routes/logs');

const homeRoutes= require('./routes/home');

const outilsRoutes= require('./routes/outils');

const processusRoutes= require('./routes/processus');

const errorController = require('./controllers/error');

const parseurl = require('parseurl')

const config = require('./config/config');

const app = express();

const ports = process.env.PORT || config.serverPort;

const auth      = require("./auth/auth")


//******proxy configuration global************//

const proxy = require("node-global-proxy").default;

const MemoryStore = require('memorystore')(session);

proxy.setConfig(config.proxy);

proxy.start();

//*********************************************//

app.use(bodyParser.json({ limit: '50mb' }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(session({
  store: new MemoryStore({ checkPeriod: 3600000 }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true, // réinitialise l'expiration à chaque requête (déconnexion après 1h d'inactivité, pas 1h depuis la connexion)
  cookie: {
    httpOnly: true,
    // 'auto' : cookie "Secure" quand la requête arrive en HTTPS (via le proxy de confiance, X-Forwarded-Proto),
    // et non sécurisé en HTTP local pour ne pas bloquer le développement
    secure: 'auto',
    // 'lax' (et non 'strict') : le cookie doit être envoyé au retour d'Azure (redirection GET de premier niveau)
    sameSite: 'lax',
    maxAge: 3600000,
  }
}));


app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(auth.passport.initialize());
app.use(auth.passport.session());

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Erreur lors de la déconnexion :', err);
      return res.status(500).send({ message: 'Erreur lors de la déconnexion' });
    }

    // Détruire la session et envoyer une réponse
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send({ message: 'Erreur lors de la destruction de la session' });
      }
      res.clearCookie('connect.sid');
      // Transmettre le motif (liste blanche) pour afficher le bon message sur /not-user
      const raison = ['acces-refuse', 'echec-connexion'].includes(req.query.raison) ? req.query.raison : null;
      res.redirect(raison ? `/not-user?raison=${raison}` : '/not-user');
    });
  });
});



app.use('/auth', userUdemRoutes);

//app.use('', userUdemRoutes);

// Definir proxy url dans la creation du serveur
app.set('trust proxy', '10.139.33.12');

//controlleur periodique
app.use('/periodique', periodiqueRoutes);

//controlleur archives pour une periodique
app.use('/archive', archiveRoutes);

//controlleur archives pour une periodique
app.use('/historique', historiqueRoutes);

//controlleur note pour une periodique
app.use('/note', noteRoutes);

//controlleur statistique pour une periodique
app.use('/statistique', statistiqueRoutes);

//controlleur prix pour une periodique
app.use('/prix', prixRoutes);

//controlleur plateforme
app.use('/plateforme', plateformeRoutes);

app.use('/importation', sushiRoutes);

//controlleur mise a jour statistique selon données soushi
app.use('/update-statistique', updateStatistiqueRoutes);

//controlleur pour la liste des statistiques
app.use('/liste-statistique', listeStatistiqueRoutes);

//controlleur pour import par csv
app.use('/import-csv', importCsvRoutes);

//controlleur pour les logs
app.use('/logs', logsRoutes);

//controlleur pour les données de board
app.use('/home', homeRoutes);

//controlleur pour les outils
app.use('/outils',outilsRoutes);

//controlleur pour les processus
app.use('/processus',processusRoutes);

//passport user
app.use('/user-udem', userUdemRoutes);

//passport user
app.get('/connect-user', function (req, res, next) {
  const user = req.session.user;
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(401).json({ message: 'User not connected' });
  }
});



app.use(errorController.get404);

app.use(errorController.get500);


app.listen(ports, () => console.log(`listening on port ${ports}`));




