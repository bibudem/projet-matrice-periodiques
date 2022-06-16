var requetesServeurFilms = function(action){
	switch (action){
		case "lister":
			$.ajax({
				type : "POST",
				url : '/films',
				data : {'action':'lister'},
				dataType : 'json',
				success : function (jsonFilms){//alert(JSON.stringify(jsonFilms));
					gestionViewFilms(jsonFilms,'lister');
				},
				fail : function (){
				}
			});
		break;
		case "enregistrer":
			var formFilm = new FormData(document.getElementById('formNouveau'));
			formFilm.append('action','enregistrer');
			$.ajax({
				type : 'POST',
				url : 'localhost:8080/films',
				data : formFilm,
				dataType : 'json',
				contentType : false,
				processData : false,
				success : function (reponse) {
				    $('#formNouveau')[0].reset();
					gestionViewFilms(reponse,'enregistrer');
					vider('message');
				},
				fail : function (){
				}
			});
		break;
		case 'enlever' :
			var num=$('#num').val();
			$.ajax({
			  type: "POST",
			  url: "/films",
			  data: { "action": "enlever","num":num},
			  dataType : 'json',
			  success : function(reponse){
					  $('#montrerE')[0].reset();
					  gestionViewFilms(reponse,'enlever');
					  vider('message');
			  },
			  fail : function(){

			  }
			});
		break;
		case 'dossier' :
		    var num=$('#num').val();
			$.ajax({
			  type: "POST",
			  url: "/films",
			   data: { "action": "dossier","num":num},
			  dataType : 'json',
			  success : function(formFilms){//alert(JSON.stringify(formFilms));
					  gestionViewFilms(formFilms[0],'dossier');
			  },
			  fail : function(){

			  }
			});
		break;
		case 'maj' :
			var formFilm = new FormData(document.getElementById('formNouveau'));
			formFilm.append('action','modifier');
			//formFilm.append('code','maj');
			$.ajax({
				type : 'POST',
				url : '/films',
				data : formFilm,
				dataType : 'json', //text pour le voir en format de string
				contentType : false,
				processData : false,
				success : function (reponse){
							gestionViewFilms(reponse,'maj');
							vider('message');
							$('#contenu').html("");
				},
				fail : function (){
				}
			});
		break;
	}
}
