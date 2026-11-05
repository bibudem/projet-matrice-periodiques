const UserAuth = require('./callback');

// Méthodes HTTP de consultation (aucune modification de données)
const READ_ONLY_METHODS = ['GET', 'HEAD', 'OPTIONS'];

/**
 * Vérifie que l'utilisateur est authentifié ET appartient à un groupe autorisé.
 * - not-user (authentifié UdeM mais hors des groupes) -> 403
 * - Viewer : consultation seulement (GET/HEAD/OPTIONS) ; toute écriture -> 403
 * - Admin  : accès complet
 * Le rôle est exposé dans req.userRole.
 */
async function authMiddleware(req, res, next) {
  try {
    const token = req.session?.token;
    const user = token ? req.session.passport?.user?.[token] : null;
    if (!user) {
      return res.status(401).json({ message: 'Non autorisé. Veuillez vous connecter.' });
    }

    const [ficheUser] = await UserAuth.returnUserUdem(user);
    const role = ficheUser.groupe;

    if (role !== 'Admin' && role !== 'Viewer') {
      return res.status(403).json({ message: 'Accès refusé.' });
    }

    if (role !== 'Admin' && !READ_ONLY_METHODS.includes(req.method)) {
      return res.status(403).json({ message: 'Accès en lecture seule : action non autorisée.' });
    }

    req.userRole = role;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Session invalide. Veuillez vous reconnecter.' });
  }
}

/**
 * À ajouter APRÈS authMiddleware sur les routes GET qui modifient des données
 * (imports, mises à jour déclenchées par GET).
 */
authMiddleware.adminOnly = (req, res, next) => {
  if (req.userRole !== 'Admin') {
    return res.status(403).json({ message: 'Action réservée aux gestionnaires.' });
  }
  next();
};

module.exports = authMiddleware;
