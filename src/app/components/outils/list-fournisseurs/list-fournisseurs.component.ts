import {Component, OnInit, ViewChild} from '@angular/core';
import {Observable} from "rxjs";
import {MatPaginator} from "@angular/material/paginator";
import {MethodesGlobal} from "../../../lib/MethodesGlobal";
import {OutilsService} from "../../../services/outils.service";
import {TranslateService} from "@ngx-translate/core";
import {MatTableDataSource} from "@angular/material/table";
import {tap} from "rxjs/operators";
import {Router} from "@angular/router";
import {MatSort} from "@angular/material/sort";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmDialogComponent} from "../../../lib/confirm-suppression-dialog.component";

@Component({
  selector: 'app-list-fournisseurs',
  templateUrl: './list-fournisseurs.component.html',
  styleUrls: ['./list-fournisseurs.component.css']
})
export class ListFournisseursComponent implements OnInit {
  fournisseurs$: Observable<any[]> | undefined;

  fournisseur: any = [];

  id: string | null | undefined;
  displayedColumns = ['numero', 'titre', 'dateA', 'dateM', 'actions'];
  listeFournisseurs: any = [];
  // @ts-ignore
  dataSource: MatTableDataSource<listeFournisseurs>;

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
    this.creerListeFournisseurs();
    this.methodesGlobal.nonAfficher('alert-add');
  }

  async creerListeFournisseurs() {
    try {
      this.translate.get('btn-ajouter').subscribe((res: string) => {
        this.bouttonAction = res;
      });
      this.fournisseurs$ = await this.allFournisseurs();
      await this.fournisseurs$.toPromise().then(res => {
        for (let i = 0; i < res.length; i++) {
          this.fournisseur[i] = {
            'numero': i + 1,
            'idFournisseurs': res[i].idFournisseurs,
            'titre': res[i].titre,
            'description': res[i].description,
            'dateA': res[i].dateA,
            'dateM': res[i].dateM
          };
        }
        this.dataSource = new MatTableDataSource(this.fournisseur);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.matSort;
      });
    } catch (err: any) {
      console.error(`Error : ${err.message}`);
    }
  }

  async apliquerModifier(id: number) {
    this.isEditing = true;
    this.fournisseurs$ = await this.consulterFournisseur(id);
    if (this.fournisseurs$ !== undefined) {
      this.fournisseurs$.subscribe(res => {
        this.fournisseur = res[0];
        this.translate.get('btn-enregistrer').subscribe((res: string) => {
          this.bouttonAction = res;
        });
        if (this.fournisseur) {
          // @ts-ignore
          document.getElementById('idFournisseurs').value = this.fournisseur.idFournisseurs;
          // @ts-ignore
          document.getElementById('titre').value = this.fournisseur.titre;
          // @ts-ignore
          document.getElementById('description').value = this.fournisseur.description;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/accueil']);
  }

  confirmerModification(titre: string, description: string, idFournisseurs: string): void {
    const isAdd = !this.isEditing;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        titre: isAdd ? 'Ajouter le fournisseur' : 'Enregistrer les modifications',
        message: isAdd
          ? 'Êtes-vous sûr de vouloir ajouter ce fournisseur ?'
          : `Êtes-vous sûr de vouloir enregistrer les modifications apportées à « ${titre} » ?`,
        confirmLabel: isAdd ? 'Ajouter' : 'Enregistrer',
        confirmColor: 'primary'
      }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      if (isAdd) {
        this.postFournisseurs(titre, description);
      } else {
        this.update(this.methodesGlobal.convertNumber(idFournisseurs), titre, description);
      }
    });
  }

  confirmerSuppression(id: number, titre: string): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        titre: 'Supprimer le fournisseur',
        message: `Êtes-vous sûr de vouloir supprimer le fournisseur « ${titre} » ? Cette action est irréversible.`,
        confirmLabel: 'Supprimer',
        confirmColor: 'warn'
      }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.fournisseurs$ = this.outilsService
        .deleteFournisseur(id)
        .pipe(tap(() => this.rechargeInterface()));
    });
  }

  postFournisseurs(newTitre: string, newDescription: string): void {
    if (!newTitre) return;
    this.fournisseur = {
      titre: newTitre,
      description: newDescription
    };
    this.fournisseurs$ = this.outilsService
      .postFournisseur(this.fournisseur)
      .pipe(tap(() => this.rechargeInterface()));
  }

  update(idFournisseurs: number, newTitre: string, newDescription: string): void {
    if (!newTitre) return;
    this.fournisseur = {
      idFournisseurs: idFournisseurs,
      titre: newTitre,
      description: newDescription
    };
    this.fournisseurs$ = this.outilsService
      .updateFournisseur(this.fournisseur)
      .pipe(tap(() => this.rechargeInterface()));
  }

  consulterFournisseur(id: number) {
    return this.outilsService.consulterFournisseur(id);
  }

  allFournisseurs(): Observable<any[]> {
    return this.outilsService.allFournisseurs();
  }

  rechargeInterface() {
    let that = this;
    setTimeout(function () {
      that.methodesGlobal.nonAfficher('alert-add');
    }, 2000);
    this.reload('/list-fournisseurs');
  }

  async reload(url: string): Promise<boolean> {
    await this.router.navigateByUrl('.', { skipLocationChange: true });
    return this.router.navigateByUrl(url);
  }
}
