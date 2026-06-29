import {Component, OnInit, ViewChild} from '@angular/core';
import {Observable} from "rxjs";
import {MatPaginator} from "@angular/material/paginator";
import {MethodesGlobal} from "../../../../lib/MethodesGlobal";
import {OutilsService} from "../../../../services/outils.service";
import {TranslateService} from "@ngx-translate/core";
import {MatTableDataSource} from "@angular/material/table";
import {tap} from "rxjs/operators";
import {Router} from "@angular/router";
import {MatSort} from "@angular/material/sort";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmDialogComponent} from "../../../../lib/confirm-suppression-dialog.component";

@Component({
  selector: 'app-list-fonds',
  templateUrl: './list-fonds.component.html',
  styleUrls: ['./list-fonds.component.css']
})
export class ListFondsComponent implements OnInit {
  fonds$: Observable<any[]> | undefined;

  fond: any = [];

  id: string | null | undefined;
  displayedColumns = ['numero', 'titre', 'description', 'dateM', 'actions'];
  listeFonds: any = [];
  // @ts-ignore
  dataSource: MatTableDataSource<listeFonds>;
  @ViewChild(MatPaginator) paginator: MatPaginator | any;
  @ViewChild(MatSort) matSort: MatSort | any;

  methodesGlobal: MethodesGlobal = new MethodesGlobal();
  bouttonAction = '';
  isEditing = false;
  ifAdmin = false;

  constructor(
    private router: Router,
    private outilsService: OutilsService,
    private translate: TranslateService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.ifAdmin = this.methodesGlobal.ifAdminFunction();
    this.creerListeFonds();
    this.methodesGlobal.nonAfficher('alert-add');
  }

  async creerListeFonds() {
    try {
      this.translate.get('btn-ajouter').subscribe((res: string) => {
        this.bouttonAction = res;
      });
      this.fonds$ = await this.allFonds();
      await this.fonds$.toPromise().then(res => {
        for (let i = 0; i < res.length; i++) {
          this.listeFonds[i] = {
            'numero': i + 1,
            'idFond': res[i].idFond,
            'titre': res[i].titre,
            'description': res[i].description,
            'dateA': res[i].dateA,
            'dateM': res[i].dateM
          };
        }
        this.dataSource = new MatTableDataSource(this.listeFonds);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.matSort;
      });
    } catch (err: any) {
      console.error(`Error : ${err.message}`);
    }
  }

  async apliquerModifier(id: number) {
    this.isEditing = true;
    this.fonds$ = await this.consulterFond(id);
    this.fonds$.subscribe(res => {
      this.fond = res[0];
      this.translate.get('btn-enregistrer').subscribe((res: string) => {
        this.bouttonAction = res;
      });
      if (this.fond) {
        // @ts-ignore
        document.getElementById('idFond').value = this.fond.idFond;
        // @ts-ignore
        document.getElementById('titre').value = this.fond.titre;
        // @ts-ignore
        document.getElementById('description').value = this.fond.description;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/accueil']);
  }

  confirmerModification(titre: string, description: string, idFond: string): void {
    const isAdd = !this.isEditing;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        titre: isAdd ? 'Ajouter le fond' : 'Enregistrer les modifications',
        message: isAdd
          ? 'Êtes-vous sûr de vouloir ajouter ce fond ?'
          : `Êtes-vous sûr de vouloir enregistrer les modifications apportées à « ${titre} » ?`,
        confirmLabel: isAdd ? 'Ajouter' : 'Enregistrer',
        confirmColor: 'primary'
      }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      if (isAdd) {
        this.postFond(titre, description);
      } else {
        this.update(this.methodesGlobal.convertNumber(idFond), titre, description);
      }
    });
  }

  confirmerSuppression(id: number, titre: string): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        titre: 'Supprimer le fond',
        message: `Êtes-vous sûr de vouloir supprimer le fond « ${titre} » ? Cette action est irréversible.`,
        confirmLabel: 'Supprimer',
        confirmColor: 'warn'
      }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.fonds$ = this.outilsService
        .deleteFond(id)
        .pipe(tap(() => this.rechargeInterface()));
    });
  }

  postFond(newTitre: string, newDescription: string): void {
    if (!newTitre) return;
    this.fond = {
      newdescription: newTitre,
      newtitre: newDescription
    };
    this.fonds$ = this.outilsService
      .postFond(this.fond)
      .pipe(tap(() => this.rechargeInterface()));
  }

  update(idFond: number, newTitre: string, newDescription: string): void {
    if (!newTitre) return;
    this.fond = {
      idFond: idFond,
      newdescription: newTitre,
      newtitre: newDescription
    };
    this.fonds$ = this.outilsService
      .updateFond(this.fond)
      .pipe(tap(() => this.rechargeInterface()));
  }

  consulterFond(id: number) {
    return this.outilsService.consulterFond(id);
  }

  allFonds(): Observable<any[]> {
    return this.outilsService.allFonds();
  }

  rechargeInterface() {
    this.listeFonds = [];
    this.isEditing = false;
    this.translate.get('btn-ajouter').subscribe((res: string) => {
      this.bouttonAction = res;
    });
    this.methodesGlobal.afficher('alert-add-note');
    this.creerListeFonds();
    // @ts-ignore
    document.getElementById('idFond').value = '';
    // @ts-ignore
    document.getElementById('titre').value = '';
    // @ts-ignore
    document.getElementById('description').value = '';
    let that = this;
    setTimeout(function () {
      that.methodesGlobal.nonAfficher('alert-add');
    }, 2000);
  }
}
