const auth = require("../auth/auth");

module.exports = (req, res, next) => {
  const token = req.session ? req.session.token : null;
  const user = auth.passport.session.userConnect[token];

  if (user.length === 0) {
    return res.status(401).json({ message: 'Non autorisé. Veuillez vous connecter.' });
  }
  next();
};
