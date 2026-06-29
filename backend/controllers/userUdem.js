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
      return res.redirect('/api/logout');
    }

    return res.status(200).json(ficheUser);

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

