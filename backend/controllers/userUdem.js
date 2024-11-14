const UserAuth = require("../auth/callback");
const auth = require("../auth/auth");

// Handler to fetch user information
exports.getUserUdem = async (req, res, next) => {
  try {
    const token = req.session ? req.session.token : null;
    const user = auth.passport.session.userConnect[token];
    if (!user) {
      return res.redirect('/api/logout'); // Renvoie et arrête l'exécution si l'utilisateur n'est pas connecté
    }

    const [ficheUser] = await UserAuth.returnUserUdem(user);

    if(ficheUser=='not-user'){
      res.redirect('/api/logout');
    }

    res.status(200).json(ficheUser);

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

