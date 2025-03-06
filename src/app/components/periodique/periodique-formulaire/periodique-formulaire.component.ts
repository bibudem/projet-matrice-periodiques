import {Component,  OnInit, ViewChild} from "@angular/core";
import {Router} from "@angular/router";
import { Observable } from "rxjs";
import { Periodique } from "src/app/models/Periodique";
import { tap } from "rxjs/operators";
import {PeriodiqueFormulaireService} from "../../../services/periodique-formulaire.service";
import { ActivatedRoute } from "@angular/router";
//directives pour le formulaire
import {NgForm } from '@angular/forms';
import {MethodesGlobal} from "../../../lib/MethodesGlobal";
import {ListeChoixOptions} from "../../../lib/ListeChoixOptions";
import {TranslateService} from "@ngx-translate/core";
import {PeriodiqueArchiveService} from "../../../services/periodique-archive.service";
import {PeriodiqueHistoriqueService} from "../../../services/periodique-historique.service";
import {PeriodiqueNotesService} from "../../../services/periodique-note.service";
import {PeriodiqueStatistiquesService} from "../../../services/periodique-statistique.service";
import {PeriodiquePrixService} from "../../../services/periodique-prix.service";
import {OutilsService} from "../../../services/outils.service";
import {Location} from '@angular/common';

@Component({
  selector: "app-grocery-list",
  templateUrl: "./periodique-formulaire.component.html",
  styleUrls: ["./periodique-formulaire.component.css"],
})
export class PeriodiqueFormulaireComponent implements OnInit {

  [x: string]: any;
//*********Section variables*****************************************//

  //titre boutton
  bouttonAction='';

  periodiques$: Observable<Periodique[]> | undefined;
  //creation d'objet avec la liste des periodiques
  idRevue: number = 0;

  //importer les fonctions global
  methodesGlobal: MethodesGlobal = new MethodesGlobal();

  //importer les liste des choix
  listeChoixOptions: ListeChoixOptions = new ListeChoixOptions();

  //importer les archives,core,statistique et note
  archives$: Observable<any> | undefined;
  tableauArchives: any = [];

  historiques$: Observable<any> | undefined;
  tableauHistorique: any = [];

  notes$: Observable<any> | undefined;
  tableauNote: any = [];

  statistiques$: Observable<any> | undefined;
  tableauStatistique: any = [];

  moyennes$: Observable<any> | undefined;
  tableauMoyenne: any = [];

  prix$: Observable<any> | undefined;
  tableauPrix: any = [];

  //creer la liste des plateforme
  plateformes$: Observable<any> | undefined;
  listePlateforme: any = [];

  fournisseurs$: Observable<any> | undefined;
  listeFounisseurs: any = [];

  //creer la liste des plateforme
  fonds$: Observable<any> | undefined;
  listeFonds: any = [];

  multiListePlateforme: any =[]

  multiListeFonds: any =[]

  multiListeSecteur: any =[]

  autrePlateforme:any=[]

  optionAutrePlateforme:any=[]

  selectfonds:any=[]

  ifAdmin=false;
  action: string = "add";
  periodique: Periodique = {
    idRevue: 0,
    titre: "",
    ISSN: "",
    EISSN: "",
    accesCourant: "",
    statut: "",
    abonnement: "",
    bdd: "",
    fonds: "",
    fournisseur: "",
    plateformePrincipale: "",
    autrePlateforme: "",
    format: "",
    libreAcces: "",
    domaine: "",
    secteur: "",
    sujets: "",
    entente_consortiale: "",
    duplication: "",
    duplicationCourant: "",
    duplicationEmbargo1: "",
    duplicationEmbargo2: "",
    essentiel2014: "",
    essentiel2022: ""
  };

  // @ts-ignore
  @ViewChild('closebutton') closebutton:any

  constructor(private periodiqueFormulaireService: PeriodiqueFormulaireService,
              private archiveService: PeriodiqueArchiveService,
              private historiqueService: PeriodiqueHistoriqueService,
              private noteService: PeriodiqueNotesService,
              private statistiqueService: PeriodiqueStatistiquesService,
              private prixService: PeriodiquePrixService,
              private route: ActivatedRoute,
              private router: Router,
              private translate: TranslateService,
              private plateformeService: OutilsService,
              private _location: Location) {}

  ngOnInit(): void {
    localStorage.setItem('titrePeridique','');
    //ajout de niveau de securité
    this.ifAdmin=this.methodesGlobal.ifAdminFunction()
    //remplire la liste des plateforme
    this.creerTableauPlateforme();

    this.creerTableauFournisseurs();
    //remplire la liste des fonds
    this.creerTableauFonds()

    //recouperer le bon titre du bouton
    this.translate.get('btn-ajouter').subscribe((res: string) => {
      this.bouttonAction=res;
    });
    //afficher le bon bouton
    this.methodesGlobal.afficher('addBoutton');
    this.methodesGlobal.nonAfficher('saveBoutton');

    // @ts-ignore
    this.idRevue = this.route.snapshot.paramMap.get("id");
    //console.log(this.id);
    //prendre la fiche
    if(this.idRevue!=null){
      this.remplireFiche(this.idRevue);
    }

  }
  //return historique page
  backClicked() {
    this._location.back();
  }
  //remplire la fiche de periodique
  async remplireFiche(id:number){
    //action update
    this.action='save'
    //changer le texte pour le boutton
    //recouperer le bon titre du bouton
    this.translate.get('btn-enregistrer').subscribe((res: string) => {
      this.bouttonAction=res;
    });
    //cacher le boutton add
    this.methodesGlobal.nonAfficher('addBoutton');
    this.methodesGlobal.afficher('saveBoutton');

    this.periodiques$ = this.consulter(id);
    this.periodiques$.subscribe(res => {
      //creation d'objet periodique
      this.periodique =res[0];
      console.log(this.periodique);
      //recouperer les données a multi choix des autres plateformes
      if(res[0].autrePlateforme && res[0].autrePlateforme.indexOf(',')!=-1){
        for(let at of res[0].autrePlateforme.split(',')){
          if(at!=''){
            for (let i = 0; i < this.listePlateforme.length; i++) {
              if(this.listePlateforme[i]['idPlateforme']==at)
                this.optionAutrePlateforme.push(this.listePlateforme[i]['idPlateforme'])
            }
          }
        }
      }else{
        if(res[0].autrePlateforme){
          for (let i = 0; i < this.listePlateforme.length; i++) {
            if(this.listePlateforme[i]['idPlateforme']==res[0].autrePlateforme)
              this.optionAutrePlateforme.push(this.listePlateforme[i]['idPlateforme'])
          }
        }
      }

      this.periodique.autrePlateforme= this.optionAutrePlateforme

      //recouperer les données a multichoix des differents fonds
      if(res[0].fonds && res[0].fonds.indexOf(',')!=-1){
        for(let ft of res[0].fonds.split(',')){
          if(ft!='')
            this.selectfonds.push(ft)
        }
      }else{
        if(res[0].fonds){
          this.selectfonds.push(res[0].fonds)
         }
      }
        this.periodique.fonds= this.selectfonds

      //recouperer les données a multichoix des differents secteur
        if(res[0].secteur && res[0].secteur.indexOf(',')!=-1){
          for(let ft of res[0].secteur.split(',')){
            if(ft!='')
              this.multiListeSecteur.push(ft)
          }
        }else{
          if(res[0].secteur){
            this.multiListeSecteur.push(res[0].secteur)
          }
        }

      this.periodique.secteur= this.multiListeSecteur

      //conserver le titre et l'id de la periodique
      localStorage.setItem('titrePeridique',this.periodique.titre);
      localStorage.setItem('idRevue',id.toString());
    });

    //remplire les tableaux pour les aonglets
    this.creerTableauArchive(id);
    //console.log(this.tableauArchives);
    this.creerTableauHistorique(id);

    this.creerTableauNote(id);

    this.creerTableauStatistique(id);

    this.creerTableauPrix(id);

    this.creerTableauMoyenne(id);

  }
  async creerTableauPlateforme() {
    try {
      this.plateformes$ = this.plateformeService.fetchAll();
      // @ts-ignore
      await this.plateformes$.toPromise().then(res => {
        for (let i = 0; i < res.length; i++) {
          this.listePlateforme[i]={
            "numero":i+1,
            "idPlateforme":res[i].idPlateforme,
            "titrePlateforme":res[i].titrePlateforme
          }
          this.multiListePlateforme.push({ "id": res[i].idPlateforme, "titre": res[i].titrePlateforme })
         }
      });
    } catch(err) {
      console.error(`Error : ${err.Message}`);
    }
  }

  async creerTableauFournisseurs() {
    try {
      this.fournisseurs$ = this.plateformeService.allFournisseurs();
      // @ts-ignore
      await this.fournisseurs$.toPromise().then(res => {
        for (let i = 0; i < res.length; i++) {
          this.listeFounisseurs[i]={
            "titre":res[i].titre
          }
        }
      });
    } catch(err) {
      console.error(`Error : ${err.Message}`);
    }
  }

  async creerTableauFonds() {
    try {
      this.fonds$ = this.plateformeService.allFonds();
      // @ts-ignore
      await this.fonds$.toPromise().then(res => {
        for (let i = 0; i < res.length; i++) {
          this.listeFonds[i]={
            "numero":i+1,
            "titre":res[i].titre
          }
          this.multiListeFonds.push({ "id": res[i].numero, "titre": res[i].titre })
        }
      });
    } catch(err) {
      console.error(`Error : ${err.Message}`);
    }
  }
  //retour sur la liste des periodiques
  goBack(): void {
      this.router.navigate(['/periodique/liste']);
  }

  //fonction pour inserer
  post( periodique:Periodique): void {
    this.periodiques$ = this.periodiqueFormulaireService
      .post(periodique)
      .pipe(tap(() => (this.goBack())));
  }

//mise a jour du formulaire
  update( periodique:Periodique): void {
    this.periodiques$ = this.periodiqueFormulaireService
      .update(periodique)
      .pipe(tap(() => (this.methodesGlobal.afficher('alert-periodique'))));
    setTimeout(() => {
      this.reload('periodique/'+this.idRevue);
    }, 2000);

  }
//supprimer un enregistrement
  delete(id: number): void {
    this.periodiques$ = this.periodiqueFormulaireService
      .delete(id)
      .pipe(tap(() => (this.goBack())));
  }
  //consulter une fiche
  consulter(id: number) {
    //console.log(id);
    return this.periodiqueFormulaireService.consulter(id)
  }
  async reload(url: string): Promise<boolean> {
    await this.router.navigateByUrl('.', { skipLocationChange: true });
    return this.router.navigateByUrl(url);
  }

  //creations des tableau pour les onglets

  //tableau des archives
  async creerTableauArchive(idRevue: number) {
    try {
      this.archives$ = this.archiveService.fetchAll(idRevue);
      await this.archives$.toPromise().then(res => {
        for (let i = 0; i < res.length; i++) {
            this.tableauArchives[i]={
              "numero":i+1,
              "perennite":res[i].perennite,
              "conserverPap":res[i].conserverPap,
              "anneeDebut":res[i].anneeDebut,
              "anneeFin":res[i].anneeFin,
              "volDebut":res[i].volDebut,
              "volFin":res[i].volFin,
              "embargo":res[i].embargo,
              "dateA":res[i].dateA
            }
          }
        //console.log(this.tableauArchives);
      });
    } catch(err) {
      console.error(`Error : ${err.Message}`);
    }
  }
  //tableau des historiques
  async creerTableauHistorique(idRevue: number) {
    try {
      this.historiques$ = this.historiqueService.fetchAll(idRevue);
      await this.historiques$.toPromise().then(res => {
        for (let i = 0; i < res.length; i++) {
          this.tableauHistorique[i]={
            "numero":i+1,
            "core":res[i].core,
            "annee":res[i].annee,
            "secteur":res[i].secteur,
            "dateA":res[i].dateA
          }
        }
        //console.log(this.tableauHistorique);
      });
    } catch(err) {
      console.error(`Error : ${err.Message}`);
    }
  }

  //tableau des note
  async creerTableauNote(idRevue: number) {
    try {
      this.notes$ = this.noteService.fetchAll(idRevue);
      await this.notes$.toPromise().then(res => {
        for (let i = 0; i < res.length; i++) {
          this.tableauNote[i]={
            "numero":i+1,
            "note":res[i].note,
            "dateA":res[i].dateA
          }
        }
      });
    } catch(err) {
      console.error(`Error : ${err.Message}`);
    }
  }
  //tableau des note
  async creerTableauStatistique(idRevue: number) {
    try {
      this.statistiques$ = this.statistiqueService.fetchAllResume(idRevue);
      await this.statistiques$.toPromise().then(res => {
        for (let i = 0; i < res.length; i++) {
          this.tableauStatistique[i]={
            "numero":i+1,
            "prix":res[i].prix,
            "annee":res[i].annee,
            "plateforme":res[i].plateforme,
            "Total_Item_Requests":res[i].Total_Item_Requests,
            "No_License":res[i].No_License,
            "JR3OAGOLD":res[i].JR3OAGOLD,
            "citations":res[i].citations,
            "articlesUdem":res[i].articlesUdem
          }
        }
      });
    } catch(err) {
      console.error(`Error : ${err.Message}`);
    }
  }

  //tableau des moyennes
  async creerTableauMoyenne(idRevue: number) {
    try {
      this.moyennes$ = this.statistiqueService.mayenneStatistiques(idRevue);
      await this.moyennes$.toPromise().then(res => {

        if(res!==undefined){
          this.tableauMoyenne={
            "moyenn_t":Number(res[0].moyenn_t).toFixed(2),
            "moyenn_r":Number(res[0].moyenn_r).toFixed(2),
            "moyenn_c":Number(res[0].moyenn_c).toFixed(2),
            "moyenn_a":Number(res[0].moyenn_a).toFixed(2)
          }
        }

      });
    } catch(err) {
      console.error(`Error : ${err.Message}`);
    }
  }
  //tableau des note
  async creerTableauPrix(idRevue: number) {
    try {
      this.prix$ = this.prixService.fetchAll(idRevue);
      await this.prix$.toPromise().then(res => {
        for (let i = 0; i < res.length; i++) {
          this.tableauPrix[i]={
            "numero":i+1,
            "prix":res[i].prix,
            "annee":res[i].annee,
            "dateA":res[i].dateA,
            "dateM":res[i].dateM
          }
        }
      });
    } catch(err) {
      console.error(`Error : ${err.Message}`);
    }
  }

  //prendre les valeurs d'un miltiselect
  multiValeurCreator(val:any){
   let result=''
    if(val){
      for(let v of val){
        result+=v+','
      }
    }

    return result
  }

//fonction pour valider
  onSubmit(f: NgForm) {
    // @ts-ignore
    const action = (document.getElementById('action') as HTMLInputElement)?.value;

    const valeurs = {
      idRevue: f.value.idRevue ?? 0,
      titre: f.value.titre ?? "",
      ISSN: f.value.ISSN ?? "",
      EISSN: f.value.EISSN ?? "",
      statut: f.value.statut ?? "",
      accesCourant: f.value.accesCourant ?? "",
      abonnement: f.value.abonnement ?? "",
      fonds: f.value.fonds ? this.multiValeurCreator(f.value.fonds) : "",
      fournisseur: f.value.fournisseur ?? "",
      plateformePrincipale: f.value.plateformePrincipale ?? "",
      autrePlateforme: f.value.autrePlateforme ? this.multiValeurCreator(f.value.autrePlateforme) : "",
      format: f.value.format ?? "",
      libreAcces: f.value.libreAcces ?? "",
      domaine: f.value.domaine ?? "",
      secteur: f.value.secteur ? this.multiValeurCreator(f.value.secteur) : "",
      sujets: f.value.sujets ?? "",
      entente_consortiale: f.value.entente_consortiale ?? "",
      duplication: this.methodesGlobal.checkedResult('duplication') ? 'Oui' : 'Non',
      duplicationCourant: this.methodesGlobal.checkedResult('duplicationCourant') ? 'Oui' : 'Non',
      duplicationEmbargo1: this.methodesGlobal.checkedResult('duplicationEmbargo1') ? 'Oui' : 'Non',
      duplicationEmbargo2: this.methodesGlobal.checkedResult('duplicationEmbargo2') ? 'Oui' : 'Non',
      essentiel2014: this.methodesGlobal.checkedResult('essentiel2014') ? 'Oui' : 'Non',
      essentiel2022: this.methodesGlobal.checkedResult('essentiel2022') ? 'Oui' : 'Non',
    };

    Object.assign(this.periodique, valeurs);

    console.log(this.periodique);

    // Définir les champs obligatoires
    if (!this.methodesGlobal.validationDonneesForm({ titre: this.periodique.titre })) {
      return;
    }

    this.onFermeModal();

    if (action === 'save') {
      this.update(this.periodique);
    } else if (action === 'add') {
      localStorage.setItem('textFiltre',f.value.titre);
      this.post(this.periodique);
    }
  }

  //fermer le modal une fois envoyer les données
  onFermeModal() {
    this.closebutton.nativeElement.click();
  }

  ensureArray(value: string | string[]): string[] {
    return Array.isArray(value) ? value : value ? [value] : [];
  }
}

