const express = require("express");
const userUdem = require("../controllers/userUdem");
const auth = require("../auth/auth");
const router = express.Router();
const Lib  = require("../util/lib");



const options_request={
  url: "https://google.ca",
  method: "GET"
}
const options={
  url: "https://matrice-dev.bib.umontreal.ca/api/user-udem",
  method: "GET"
}

router.get('', userUdem.getUserUdem);

//1.login

router.use('/login',
  (req, res, next) => {
    //Logout
    req.logout();
    auth.passport.authenticate('provider',{ failureRedirect: '/api/logout' })(req, res, next);
  });

//2.reponse
router.get('/callback.js',
  (req, res, next) => {
    //Logout
    req.logout()
    auth.passport.authenticate('provider', { failureRedirect: '/api/logout' },
      (err, user) => {
        if(err){
          console.log('2. passport reponse error: '+err);
          res.redirect('/api/logout');
        }
        if(!user){
          console.log('2. not user: ');
          res.redirect('/api/logout');
        }
        req.logIn(user, function(err) {

          //console.log(Lib.sessionToken(req))

          if (err) { return next(err); }
          auth.passport.session.userConnect=[]
          auth.passport.session.userConnect[Lib.sessionToken(req)]=JSON.stringify(user)

          return res.redirect('/accueil');
          //return res.status(200).json(user);
        });


        //res.status(200).json(auth.passport.session.userConnect);
        //res.redirect('/accueil');

      })
    (req, res, next);

  }
);



//google
router.use('/google',function(req,res){
  const request = require("request");

  request(
    options_request,
    function (error, response, body) {
      if (error) {
        console.log(error);
      }
      return res.send('...google page '+body);
    }
  );
});


module.exports = router;
