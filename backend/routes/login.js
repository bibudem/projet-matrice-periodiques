const express = require('express');
const router = express.Router();
const config = require('../config/config');

router.get('/', (req, res) => {
  res.redirect(`https://authentification.umontreal.ca/my.policy/oauth2/authorize?App_ID=${config.clientID}&clientSecret=${config.clientSecret}&response_type=code`);
});

module.exports = router;
