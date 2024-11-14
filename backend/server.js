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

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(session({
  store: new MemoryStore({ checkPeriod: 3600000 }),
  secret: 'AB3X9-YG2KD-Q4PL6-MN7TS-WZ8FV-YT9KD-Q4PL98',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 3600000, // Durée du cookie de session (par exemple 1 heure)
  }
}));


app.use(bodyParser.urlencoded({ extended : true }));
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
      //res.send({ message: 'User logout' });
      res.redirect('/not-user');
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




