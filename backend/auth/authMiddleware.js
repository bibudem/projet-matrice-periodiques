module.exports = (req, res, next) => {
  const token = req.session?.token;
  if (!token || !req.session.passport?.user?.[token]) {
    return res.status(401).json({ message: 'Non autorisé. Veuillez vous connecter.' });
  }
  next();
};
