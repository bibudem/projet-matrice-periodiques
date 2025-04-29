import {Component, OnInit, ViewChild} from '@angular/core';
import {Observable} from "rxjs";
import {Statistique} from "../../../models/Statistique";
import {ActivatedRoute, Router} from "@angular/router";
import {PeriodiqueStatistiquesService} from "../../../services/periodique-statistique.service";
import {TranslateService} from "@ngx-translate/core";
import {MethodesGlobal} from "../../../lib/MethodesGlobal";
import {tap} from "rxjs/operators";
import {NgForm} from "@angular/forms";
import {OutilsService} from "../../../services/outils.service";


@Component({
  selector: 'app-periodique-statistiques',
  templateUrl: './periodique-statistiques.component.html',
  styleUrls: ['./periodique-statistiques.component.css']
})
export class PeriodiqueStatistiquesComponent implements OnInit {

  statistiques$: Observable<any[]> | undefined;
  // @ts-ignore
  statistique:Statistique= {};

  tableauStatistique: any = [];

  id: string | null | undefined ;

  //definir le text pour les boutons
  bouttonAction='';

  //importer les fonctions global
  methodesGlobal: MethodesGlobal = new MethodesGlobal();

  titrePeriodique=localStorage.getItem('titrePeridique');
  idRevue=localStorage.getItem('idRevue');

  action='add';

  return=''
  bouttonFiche=false;

  ifAdmin=false;

  //creer la liste des plateforme
  plateformes$: Observable<any> | undefined;
  listePlateforme: any = [];

  @ViewChild('closebutton') closebutton:any

  constructor(private router: Router,
              private route: ActivatedRoute,
              private periodiqueStatistiquesService: PeriodiqueStatistiquesService,
              private translate: TranslateService,
              private plateformeService: OutilsService) { }

  ngOnInit(): void {
    //ajout de niveau de securité
    this.ifAdmin=this.methodesGlobal.ifAdminFunction();
    //afficher le bon bouton
    this.methodesGlobal.afficher('add-boutton-note');
    this.methodesGlobal.nonAfficher('save-boutton-note');
    //cacher div notification
    this.methodesGlobal.nonAfficher('alert-add-note');

    //recouperer courriel d'admin
    // @ts-ignore
    this.courrielAdmin=localStorage.getItem('courrielAdmin');

    if(this.route.snapshot.paramMap.get("id")){
      this.id=this.route.snapshot.paramMap.get("id");
    }else this.id = this.idRevue;

    this.creerTableau();

    //creer le return pour le bouton
    if(this.route.snapshot.paramMap.get("return")){
      this.return='/liste-statistique';
      this.bouttonFiche=true
    } else this.return='/periodique/'+this.id

    //appel pour remplire le tableaux des plateformes
    this.creerTableauPlateforme()

  }

  //fonction doit etre async pour attendre la reponse de la bd
  async creerTableau() {
    try {

      //recouperer le bon titre du bouton
      this.translate.get('btn-ajouter').subscribe((res: string) => {
        this.bouttonAction=res;
      });
      if (this.id != null) {
        this.statistiques$ = await this.fetchAll(this.methodesGlobal.convertNumber(this.id));
        await this.statistiques$.toPromise().then(res => {
          for (let i = 0; i < res.length; i++) {
            this.tableauStatistique[i]={
              "numero":i+1,
              "idStatistique":res[i].idStatistique,
              "annee":res[i].annee,
              "plateforme":res[i].plateforme,
              "Total_Item_Requests":res[i].Total_Item_Requests,
              "No_License":res[i].No_License,
              "citations":res[i].citations,
              "articlesUdem":res[i].articlesUdem,
              "JR4COURANT":res[i].JR4COURANT,
              "JR4INTER":res[i].JR4INTER,
              "JR4RETRO":res[i].JR4RETRO,
              "JR3OAGOLD":res[i].JR3OAGOLD,
              "dateA":res[i].dateA,
              "dateM":res[i].dateM
            }
          }
        });
      }
    } catch(err) {
      console.error(`Error : ${err.Message}`);
      //
    }
  }

  //tableau pour les plateformes
  async creerTableauPlateforme() {
    try {
      this.plateformes$ = this.plateformeService.fetchAll();
      // @ts-ignore
      await this.plateformes$.toPromise().then(res => {
        for (let i = 0; i < res.length; i++) {
          this.listePlateforme[i]={
            "numero":i+1,
            "PlatformID":res[i].PlatformID,
            "titrePlateforme":res[i].titrePlateforme
          }
        }
      });
    } catch(err) {
      console.error(`Error : ${err.Message}`);
    }
  }
  //appliquer modifier fiche
  async apliquerModifier(idStatistique:number) {
    //changer l'action
    this.action='save'
    //cacher le boutton add
    this.methodesGlobal.nonAfficher('add-boutton-statistique');
    this.methodesGlobal.afficher('save-boutton-statistique');

    this.statistiques$ = await this.consulter(idStatistique);
    // @ts-ignore
    await this.statistiques$.subscribe(res => {
      this.statistique =res[0];
      // @ts-ignore
      document.getElementById('idRevue').value=res[0].idRevue;
      // @ts-ignore
      document.getElementById('annee').value=res[0].annee;
      // @ts-ignore
      document.getElementById('plateforme').value=res[0].plateforme;
      // @ts-ignore
      document.getElementById('Total_Item_Requests').value=res[0].Total_Item_Requests;
      // @ts-ignore
      document.getElementById('No_License').value=res[0].No_License;
      // @ts-ignore
      document.getElementById('citations').value=res[0].citations;
      // @ts-ignore
      document.getElementById('articlesUdem').value=res[0].articlesUdem;
      // @ts-ignore
      document.getElementById('JR4COURANT').value=res[0].JR4COURANT;
      // @ts-ignore
      document.getElementById('JR4INTER').value=res[0].JR4INTER;
      // @ts-ignore
      document.getElementById('JR4RETRO').value=res[0].JR4RETRO;
      // @ts-ignore
      document.getElementById('JR3OAGOLD').value=res[0].JR3OAGOLD;

      //changer le texte pour le boutton
      this.translate.get('btn-enregistrer').subscribe((res: string) => {
        this.bouttonAction=res;
      });
    });
  }

  //retour sur le profil periodique
  goBack(): void {
    //retour sur la liste des periodiques
    this.router.navigate(['/periodique/'+this.id]);
  }

  //fonction pour inserer
  post( statistique:Statistique): void {
    this.statistiques$ = this.periodiqueStatistiquesService
      .post(statistique)
      .pipe(tap(() => (this.rechargeInterface())));
  }

  update( statistique:Statistique): void {
    //cacher le bouton
    this.methodesGlobal.nonAfficher('save-boutton-note');

    this.statistiques$ = this.periodiqueStatistiquesService
      .update(statistique)
      .pipe(tap(() => (this.rechargeInterface())));

  }

  delete(id: number): void {
    let textAlert:string='';
    //changer le texte pour le boutton
    this.translate.get('message.supprimer-text').subscribe((res: string) => {
      textAlert=res;
    });
    if(window.confirm(textAlert)) {
      this.statistiques$ = this.periodiqueStatistiquesService
        .delete(id)
        .pipe(tap(() => (this.statistiques$ = this.fetchAll(id))));
      //afficher notification
      this.methodesGlobal.afficher('alert-sup-statistique');
     let that=this;
      setTimeout(function(){
        that.methodesGlobal.nonAfficher('alert-sup-statistique');
        that.reload('periodique/statistiques/'+that.id+'/historique');
      }, 1000);
    }
  }
  //reload la page
  async reload(url: string): Promise<boolean> {
    await this.router.navigateByUrl('.', { skipLocationChange: true });
    return this.router.navigateByUrl(url);
  }
  //consulter fiche
  consulter(id: number) {
    //console.log(id);
    return this.periodiqueStatistiquesService.consulter(id);

  }
  //recouperer la liste des periodiques
  fetchAll(idRevue: number): Observable<Statistique[]> {
    return this.periodiqueStatistiquesService.fetchAll(idRevue);
  }
  //recharge page
  rechargeInterface(){
    this.tableauStatistique=[];
    //afficher la notification
    this.methodesGlobal.afficher('alert-add-note');
    //recharger le tableau des données
    this.creerTableau();
    //videz les champs
    // @ts-ignore
    document.getElementById('idRevue').value='';
    // @ts-ignore
    document.getElementById('annee').value='';
    // @ts-ignore
    document.getElementById('plateforme').value='';
    // @ts-ignore
    document.getElementById('Total_Item_Requests').value='';
    // @ts-ignore
    document.getElementById('No_License').value='';
    // @ts-ignore
    document.getElementById('citations').value='';
    // @ts-ignore
    document.getElementById('articlesUdem').value='';
    // @ts-ignore
    document.getElementById('JR4COURANT').value='';
    // @ts-ignore
    document.getElementById('JR4INTER').value='';
    // @ts-ignore
    document.getElementById('JR4RETRO').value='';
    // @ts-ignore
    document.getElementById('JR3OAGOLD').value='';
    //cacher bouton save
    this.methodesGlobal.nonAfficher('save-boutton-statistique');
    let that=this;
    setTimeout(function(){
      that.methodesGlobal.nonAfficher('alert-add-statistique');
    }, 2000);
  }
//fonction pour valider
  onSubmit(f: NgForm) {
    // @ts-ignore
    let action = document.getElementById('action').value
    // @ts-ignore
    this.statistique={}
    //recouperer les donnes pour creer l'objet
    //console.log(f.value.idStatistique)
    if(f.value.idStatistique)
      this.statistique.idStatistique=f.value.idStatistique

    if(f.value.annee)
      this.statistique.annee=f.value.annee
    else this.statistique.annee=''

    if(f.value.plateforme)
      this.statistique.plateforme=f.value.plateforme
    else this.statistique.plateforme=''

    if(f.value.Total_Item_Requests)
      this.statistique.Total_Item_Requests=f.value.Total_Item_Requests
    else this.statistique.Total_Item_Requests=''

    if(f.value.No_License)
      this.statistique.No_License=f.value.No_License
    else this.statistique.No_License=''

    if(f.value.citations)
      this.statistique.citations=f.value.citations
    else this.statistique.citations=''

    if(f.value.articlesUdem)
      this.statistique.articlesUdem=f.value.articlesUdem
    else this.statistique.articlesUdem=''

    if(f.value.JR4COURANT)
      this.statistique.JR4COURANT=f.value.JR4COURANT
    else this.statistique.JR4COURANT=''

    if(f.value.JR4INTER)
      this.statistique.JR4INTER=f.value.JR4INTER
    else this.statistique.JR4INTER=''

    if(f.value.JR4RETRO)
      this.statistique.JR4RETRO=f.value.JR4RETRO
    else this.statistique.JR4RETRO=''

    if(f.value.JR3OAGOLD)
      this.statistique.JR3OAGOLD=f.value.JR3OAGOLD
    else this.statistique.JR3OAGOLD=''

    this.statistique.idRevue=Number(this.id)
    //console.log(f.value)
    //definir les champs obligatoire
    let donnesValider:any={'annee':this.statistique.annee}

    switch (action){
      case 'save':
        if(this.methodesGlobal.validationDonneesForm(donnesValider)){
          this.onFermeModal()
          this.action='add'
          this.update(this.statistique)

        }
        //this.remplireFiche(this.idRevue)
        break
      case 'add':
        if(this.methodesGlobal.validationDonneesForm(donnesValider)){
          this.onFermeModal()
          this.post(this.statistique)
        }
        break
    }

  }
  //fermer le modal une fois envoyer les données
  onFermeModal() {
    this.closebutton.nativeElement.click();
  }
}
