const UserAuth = require("../auth/callback");
const auth = require("../auth/auth");

// Handler to fetch user information
exports.getUserUdem = async (req, res, next) => {
  try {
    const token = req.session?.token;
    const user = req.session?.passport?.user?.[token];

    if (!token || !user) {
      return res.redirect('/api/logout');
    }

    const [ficheUser] = await UserAuth.returnUserUdem(user);

    if (ficheUser.groupe === 'not-user') {
      // Trace du refus : qui, combien de groupes reçus d'Azure, et si la liste était absente (dépassement > 200)
      let nbGroupes = 0, depassement = false;
      try {
        const claims = JSON.parse(user);
        nbGroupes = Array.isArray(claims.groups) ? claims.groups.length : 0;
        depassement = !claims.groups && !!claims._claim_names?.groups;
      } catch (_) { /* jeton illisible : valeurs par défaut */ }
      console.warn(`[auth] ${new Date().toISOString()} Accès refusé : ${ficheUser.courriel || '(courriel inconnu)'}`
        + ` | groupes reçus : ${nbGroupes} | dépassement de groupes : ${depassement ? 'oui' : 'non'}`);

      // Détruire la session et répondre 403 : le frontend affiche le message d'erreur sur /not-user
      return req.logout(() => {
        req.session.destroy(() => {
          res.clearCookie('connect.sid');
          res.status(403).json({ raison: 'acces-refuse' });
        });
      });
    }

    return res.status(200).json(ficheUser);

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

