import { Component, OnInit } from '@angular/core';
import { HomeService } from '../../services/home.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css']
})
export class AccueilComponent implements OnInit {

  totalRevue = 0;
  totalTele = 0;
  totalCitation = 0;
  totalArticleUdem = 0;

  anneeSelectionnee: number = new Date().getFullYear() - 1;
  arrayAnnee: number[] = [];

  top10: any[] = [];
  maxTelech = 1;
  isLoading = true;

  constructor(private homeService: HomeService) {}

  ngOnInit(): void {
    this.anneeOptions();
    this.loadDashboard();
  }

  anneeOptions(): void {
    const now = new Date().getFullYear();
    for (let i = now - 1; i >= 2018; i--) {
      this.arrayAnnee.push(i);
    }
  }

  changerAnnee(annee: number): void {
    this.anneeSelectionnee = Number(annee);
    this.loadDashboard();
  }

  async loadDashboard(): Promise<void> {
    this.isLoading = true;
    await Promise.all([this.loadCount(), this.loadTop10()]);
    this.isLoading = false;
  }

  private async loadCount(): Promise<void> {
    try {
      const res = await this.homeService.getCount(this.anneeSelectionnee).toPromise();
      this.totalRevue      = res[0]?.count ?? 0;
      this.totalTele       = res[1]?.count ?? 0;
      this.totalCitation   = res[2]?.count ?? 0;
      this.totalArticleUdem = res[3]?.count ?? 0;
    } catch (err: any) {
      console.error('Erreur KPI :', err.message);
    }
  }

  private async loadTop10(): Promise<void> {
    try {
      const data = await this.homeService.getGraphiqueDonnees(this.anneeSelectionnee).toPromise();
      this.top10 = Array.isArray(data) ? data : [];
      this.maxTelech = this.top10.length
        ? Math.max(...this.top10.map((i: any) => Number(i.Total_Item_Requests) || 0)) || 1
        : 1;
    } catch (err: any) {
      console.error('Erreur top 10 :', err.message);
    }
  }

  barWidth(value: any): number {
    return Math.round((Number(value) / this.maxTelech) * 100);
  }

  anneePrec(): number | null {
    const idx = this.arrayAnnee.indexOf(this.anneeSelectionnee);
    return idx < this.arrayAnnee.length - 1 ? this.arrayAnnee[idx + 1] : null;
  }

  get top10Left(): any[] { return this.top10.slice(0, 5); }
  get top10Right(): any[] { return this.top10.slice(5); }

  rankClass(rank: number): string {
    if (rank === 1) return 'rang-or';
    if (rank === 2) return 'rang-argent';
    if (rank === 3) return 'rang-bronze';
    return '';
  }

  exportTop10(): void {
    const rows = this.top10.map((item, i) => ({
      'Rang':              i + 1,
      'Titre':             item.titre,
      'Téléchargements':   Number(item.Total_Item_Requests) || 0,
      "Refus d'accès":     Number(item.No_License)          || 0,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 6 }, { wch: 60 }, { wch: 18 }, { wch: 14 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Top 10');
    XLSX.writeFile(wb, `top10-periodiques-${this.anneeSelectionnee}.xlsx`);
  }
}
