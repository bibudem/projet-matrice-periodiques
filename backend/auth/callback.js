
const auth = require("./auth");

module.exports = class UserAuth {


  constructor() {

  }
  //recouperer la fiche

  static  async  returnUserUdem (param){
    let userConnect={}
    //initialiser un user avant la validation de la connexion
    userConnect['groupe']='not-user'
    //console.log(ipLocal)
    //let userConnect={'nom':'NomAdmin','prenom':'PrénomAdmin','courriel':'admin@mail.com','groupe':'Admin'}
    if(auth.passport.session.userConnect){
      if(!auth.passport.session.userConnect[param]){
        return [userConnect]
      }

      let user=JSON.parse(auth.passport.session.userConnect[param])
      //console.log(user.groups)

      for (const [param, val] of Object.entries(user)) {

        switch (param){
          case 'family_name':
            userConnect['nom']=val
            break
          case 'given_name':
            userConnect['prenom']=val
            break
          case 'upn':
            userConnect['courriel']=val
            break
          case 'groups':
              if(val.includes('bib-aut-matrice-dev-gestionnaires') ){
                userConnect['groupe']='Admin'
              }
              if(val.includes('bib-aut-matrice-dev-lecteurs') && !val.includes('bib-aut-matrice-dev-gestionnaires')){
                userConnect['groupe']='Viewer'
              }
            break
          case 'ip':
            userConnect['ip']=val
            break
        }
      }


    }
      console.log(userConnect)

      return [userConnect]


  }


}
