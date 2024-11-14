const express = require("express");
const userUdem = require("../controllers/userUdem");
const auth = require("../auth/auth");
const router = express.Router();

router.get('', userUdem.getUserUdem);

//1.login
router.use('/login', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).send({ message: 'Erreur lors de la déconnexion' });
    }
    // Redirige vers le processus d'authentification
    auth.passport.authenticate('provider', { failureRedirect: '/api/logout' })(req, res, next);
  });
});

// 2. Callback après l'authentification - Reconnecter l'utilisateur
router.get('/callback.js', (req, res, next) => {
  auth.passport.authenticate('provider', { failureRedirect: '/api/logout' }, (err, user) => {
    if (err) {
      console.log('Erreur lors de l\'authentification : ' + err);
      return res.redirect('/api/logout');
    }
    if (!user) {
      console.log('Aucun utilisateur trouvé après l\'authentification');
      return res.redirect('/api/logout');
    }

    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }

      // Sauvegarder l'utilisateur dans la session (ou autre méthode de gestion de session)
      const token = req.session ? req.session.token : null;
      auth.passport.session.userConnect = user || {};
      auth.passport.session.userConnect[token] = JSON.stringify(user);
      // Rediriger vers la page d'accueil après la connexion
      return res.redirect('/accueil');
    });
  })(req, res, next);
});


module.exports = router;
