module.exports = (req, res, next) => {
  const token = req.session.token;
  const user = req.session.passport.user[token];

  if (user.length === 0 || !token) {
    return res.status(401).json({ message: 'Non autorisé. Veuillez vous connecter.' });
  }
  next();
};
