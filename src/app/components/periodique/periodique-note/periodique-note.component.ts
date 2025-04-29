import {Component, OnInit, ViewChild} from '@angular/core';
import {Observable} from "rxjs";
import {Note} from "../../../models/Note";
import {ActivatedRoute, Router} from "@angular/router";
import {PeriodiqueNotesService} from "../../../services/periodique-note.service";
import {tap} from "rxjs/operators";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {paginationPersonnalise} from "../../../lib/paginationPersonnalise";
import {MethodesGlobal} from "../../../lib/MethodesGlobal";
//directives pour le formulaire
import {NgForm } from '@angular/forms';
import {NgModel } from '@angular/forms';
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-periodique-note',
  templateUrl: './periodique-note.component.html',
  styleUrls: ['./periodique-note.component.css']
})
export class PeriodiqueNoteComponent implements OnInit {

  notes$: Observable<Note[]> | undefined;

  //creation d'objet avec la liste des periodiques
  // @ts-ignore
  noteObj: Note = {};
  id: string | null | undefined ;
  //les entêts du tableau
  displayedColumns = ['idNote', 'note','modiffier','supprimer'];
  listeNotes: listeNote[] = [];
  // @ts-ignore
  dataSource: MatTableDataSource<listeNotes>;
  @ViewChild(MatPaginator) paginator: paginationPersonnalise | any;

  //importer les fonctions global
  methodesGlobal: MethodesGlobal = new MethodesGlobal();

  //definir le text pour les boutons
  bouttonAction='';

  titrePeriodique=localStorage.getItem('titrePeridique');
  idRevue=localStorage.getItem('idRevue');
  courrielAdmin: string  ='';

  action='add';

  ifAdmin=false;

  @ViewChild('closebutton') closebutton:any

  constructor(private router: Router,
              private route: ActivatedRoute,
              private periodiqueNotesService: PeriodiqueNotesService,
              private translate: TranslateService) { }

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
  }

  //fonction doit etre async pour attendre la reponse de la bd
  async creerTableau() {
    try {

      //recouperer le bon titre du bouton
      this.translate.get('btn-ajouter').subscribe((res: string) => {
        this.bouttonAction=res;
      });
      if (this.id != null) {
        this.notes$ = await this.fetchAll(this.methodesGlobal.convertNumber(this.id));
        await this.notes$.toPromise().then(res => {
          for (let i = 0; i < res.length; i++) {
            this.listeNotes.push(createListeNote(res[i].idNote,res[i].note));
          }
          // Redéfinir le contenu de la table avec la pagination est la recherche une fois que le resultat de la bd est returné
          this.dataSource = new MatTableDataSource(this.listeNotes);
          this.dataSource.paginator = this.paginator;
          //console.log(this.dataSource);
        });
      }
    } catch(err) {
      console.error(`Error : ${err.Message}`);
      //
    }
  }

  //appliquer modifier fiche
  apliquerModifier(idNote:number) {
    //cacher le boutton add
    this.methodesGlobal.nonAfficher('add-boutton-note');
    this.methodesGlobal.afficher('save-boutton-note');
    //changer l'action
    this.action='save'

    this.notes$ = this.consulter(idNote);
    this.notes$.subscribe(res => {
      this.noteObj =res[0];
      //console.log(this.noteObj);

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
  post(note:Note): void {

    this.notes$ = this.periodiqueNotesService
      .post(note)
      .pipe(tap(() => (this.rechargeInterface())));
  }

  update(	note:Note): void {
    //cacher le bouton
    this.methodesGlobal.nonAfficher('save-boutton-note');

    this.notes$ = this.periodiqueNotesService
      .update(note)
      .pipe(tap(() => (this.rechargeInterface())));

  }

  delete(id: number): void {
    let textAlert:string='';
    //changer le texte pour le boutton
    this.translate.get('message.supprimer-text').subscribe((res: string) => {
      textAlert=res;
    });
    if(window.confirm(textAlert)) {
      this.notes$ = this.periodiqueNotesService
        .delete(id)
        .pipe(tap(() => (this.notes$ = this.fetchAll(id))));
      //afficher notification
      this.methodesGlobal.afficher('alert-sup-note');
      let that=this;
      setTimeout(function(){
        that.methodesGlobal.nonAfficher('alert-sup-note');
        that.reload('periodique/note/'+that.idRevue);
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
   // console.log(id);
    return this.periodiqueNotesService.consulter(id);

  }
  //recouperer la liste des periodiques
  fetchAll(idRevue: number): Observable<Note[]> {
    return this.periodiqueNotesService.fetchAll(idRevue);
  }
  //recharge page
  rechargeInterface(){
    this.listeNotes=[];
    //afficher la notification
    this.methodesGlobal.afficher('alert-add-note');
    //recharger le tableau des données
    this.creerTableau();
    //videz les champs
    // @ts-ignore
    document.getElementById('idNote').value='';
    // @ts-ignore
    document.getElementById('idRevue').value='';
    // @ts-ignore
    document.getElementById('note').value='';
    //cacher bouton save
    this.methodesGlobal.nonAfficher('save-boutton-note');
    let that=this;
    setTimeout(function(){
      that.methodesGlobal.nonAfficher('alert-add-note');
    }, 2000);
  }

  //fonction pour valider
  onSubmit(f: NgForm) {
    // @ts-ignore
    let action = document.getElementById('action').value
    //recouperer les donnes pour creer l'objet
    if(f.value.idNote)
      this.noteObj.idNote=f.value.idNote

    if(f.value.note)
      this.noteObj.note=f.value.note
    else this.noteObj.note=''

    this.noteObj.courrielAdmin='courrielAdmin@umontreal.ca'

    this.noteObj.idRevue=Number(this.id)

    //definir les champs obligatoire
    let donnesValider:any={'note':this.noteObj.note}

    switch (action){
      case 'save':
        if(this.methodesGlobal.validationDonneesForm(donnesValider)){
          this.onFermeModal()
          this.update(this.noteObj)
        }
        //this.remplireFiche(this.idRevue)
        break
      case 'add':
        if(this.methodesGlobal.validationDonneesForm(donnesValider)){
          this.onFermeModal()
          this.post(this.noteObj)
        }
        break
    }

  }
  //fermer le modal une fois envoyer les données
  onFermeModal() {
    this.closebutton.nativeElement.click();
  }

}
/** Fonction pour remplire le tableau de la liste des notes */

function createListeNote(idNoteP:number,noteP:string): listeNote {
  return {
    idNote:idNoteP,
    note: noteP,
    modifier: '',
    supprimer: '',
  };
}
/** Class utilisée pour remplire le tableau avec la liste des notes**/
export interface listeNote {
  idNote:number;
  note: string;
  modifier:string;
  supprimer:string;
}
