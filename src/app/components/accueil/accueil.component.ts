import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { HomeService } from "../../services/home.service";
import { Observable } from "rxjs";
import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexLegend,
  ApexStroke,
  ApexXAxis,
  ApexFill,
  ApexTooltip
} from "ng-apexcharts";
import { TranslateService } from "@ngx-translate/core";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  fill: ApexFill;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
};

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css']
})
export class AccueilComponent implements OnInit {
  @ViewChild("chart") chart: ChartComponent | null = null;

  chartOptions: Partial<ChartOptions> | any;

  totalRevue = 0;
  totalTele = 0;
  totalCitation = 0;
  totalArticleUdem = 0;

  counts$: Observable<any> | undefined;

  annee = new Date().getFullYear() - 1;

  // Variables pour le graphique
  titreGraphique = '';
  labelTelechargements = '';
  labelUnique = '';
  labelRefus = '';

  objGraphique$: Observable<any> | undefined;
  objGraphique: any = {};
  dataTel: string[] = [];
  dataUnique: string[] = [];
  dataRefus: string[] = [];
  dataTitre: string[] = [];

  constructor(private homeService: HomeService, private translate: TranslateService) {}

  ngOnInit(): void {
    this.getCount();
    this.remplireObjetGraphique();
  }

  async getCount() {
    try {
      this.counts$ = this.homeService.getCount();
      const res = await this.counts$.toPromise();
      this.totalRevue = res[0]?.count ?? 0;
      this.totalTele = res[1]?.count ?? 0;
      this.totalCitation = res[2]?.count ?? 0;
      this.totalArticleUdem = res[3]?.count ?? 0;
    } catch (err) {
      console.error(`Error: ${err.message}`);
    }
  }

  async remplireObjetGraphique() {
    try {
      this.labelTelechargements = await this.translate.get('telechargements').toPromise();
      this.labelUnique = await this.translate.get('unique-telechargements').toPromise();
      this.labelRefus = await this.translate.get('refus').toPromise();
      this.titreGraphique = await this.translate.get('titre-graphique').toPromise();

      const graphData = await this.homeService.getGraphiqueDonnees().toPromise();

      if (Array.isArray(graphData) && graphData.length) {
        graphData.forEach((item: any) => {
          this.dataTitre.push(item?.titre || '');
          this.dataTel.push(item?.Total_Item_Requests?.toLocaleString() || '0');
          this.dataUnique.push(item?.Unique_Item_Requests?.toLocaleString() || '0');
          this.dataRefus.push(item?.No_License?.toLocaleString() || '0');
        });
      }

      this.setChartOptions();
    } catch (error) {
      console.error("Error populating graph data: ", error);
    }
  }

  setChartOptions() {
    this.chartOptions = {
      series: [
        { name: this.labelTelechargements, data: this.dataTel },
        { name: this.labelUnique, data: this.dataUnique },
        { name: this.labelRefus, data: this.dataRefus },
      ],
      chart: {
        type: "bar",
        height: 500
      },
      plotOptions: {
        bar: {
          horizontal: true,
          columnWidth: "55%",
          endingShape: "rounded"
        }
      },
      colors: ["#1bdbe0", "#0071b9", "#ff4d6b"],
      dataLabels: { enabled: false },
      stroke: {
        show: true,
        width: 3,
        colors: ["transparent"]
      },
      xaxis: { categories: this.dataTitre },
      yaxis: { title: { text: this.titreGraphique } },
      fill: { opacity: 1 },
      tooltip: { y: { formatter: (val: string) => ` ${val}` } },
    };
  }
}
