const express = require("express");
const crypto = require("crypto");
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
    auth.passport.authenticate('provider', { failureRedirect: '/api/logout?raison=echec-connexion' })(req, res, next);
  });
});

router.get('/callback.js', (req, res, next) => {
  auth.passport.authenticate('provider', { failureRedirect: '/api/logout?raison=echec-connexion' }, (err, user, info) => {
    if (err) {
      console.error(`[auth] ${new Date().toISOString()} Échec de connexion (erreur Azure/OAuth) : ${err.message || err}`);
      return res.redirect('/api/logout?raison=echec-connexion');
    }
    if (!user) {
      // ex. "Unable to verify authorization request state." si le state OAuth ne correspond pas
      console.warn(`[auth] ${new Date().toISOString()} Échec de connexion (aucun utilisateur) : ${info?.message || 'raison inconnue'}`);
      return res.redirect('/api/logout?raison=echec-connexion');
    }

    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }

      // Vérification ou création du token
      const token = req.session.token || generateNewToken();
      req.session.token = token;
      req.session.passport.user[token]  = JSON.stringify(user);

      // Rediriger vers la page d\'accueil après la connexion
      return res.redirect('/accueil');
    });
  })(req, res, next);
});


function generateNewToken() {
  return crypto.randomBytes(32).toString('hex');
}



module.exports = router;
