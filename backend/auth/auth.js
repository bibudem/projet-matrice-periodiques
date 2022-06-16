"use strict";

const AzureOAuth2Strategy  = require("passport-azure-oauth2");
const jwt                   = require("jwt-simple");
const config                   = require("../config/config");

function AzureOAuthStrategy() {
  this.passport = require("passport");



  this.passport.use("provider", new AzureOAuth2Strategy({
      clientID: config.clientID,
      clientSecret: config.clientSecret,
      callbackURL: config.redirectURI,
      scope:'openid%20profile%20email%20phone%20address',
      response_type:'code',
      origin: "Application",
      state:false
    },


    function (accessToken, refreshtoken, params, profile, done) {

      let user = jwt.decode(params.id_token, "name", true);

      //console.log(params)
      //console.log(jwtClaims)
      done(null, user);
    }));


  this.passport.serializeUser(function(user, done) {
    //console.log("profile : ", user);
    done(null, user);
  })

  this.passport.deserializeUser(function(user, done) {
    //console.log("profile : ", user);
    done(null, user);
  });
}

module.exports = new AzureOAuthStrategy();
