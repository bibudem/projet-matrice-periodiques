function functionHeaderAnimation() {

      var word = ['MATRICE DES PÉRIODIQUES', 'MODE DÉVELOPPEMENT'];
      var element = document.getElementById("titre-projet").innerHTML ;
      alert(element)
      var wordIndex = 1;

      var resetAnimation = function() {
        element.classList.remove('flip');
      }

      setInterval(function(){
          switch (wordIndex) {
            case 0:
              element.classList.add('flip');
              element.textContent = word[wordIndex];
              wordIndex = 1;
              setTimeout(resetAnimation, 1000);
            break;

            case 1:
              element.classList.add('flip');
              element.textContent = word[wordIndex];
              wordIndex = 2;
              setTimeout(resetAnimation, 1000);
            break;

            case 2:
              element.classList.add('flip');
              element.textContent = word[wordIndex];
              wordIndex = 3;
              setTimeout(resetAnimation, 1000);
            break;

            case 3:
              element.classList.add('flip');
              element.textContent = word[wordIndex];
              wordIndex = 0;
              setTimeout(resetAnimation, 1000);
            break;
          }
      },2000)
}

functionHeaderAnimation();