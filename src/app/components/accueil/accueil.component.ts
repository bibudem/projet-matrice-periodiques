import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {HomeService} from "../../services/home.service";
import {Observable} from "rxjs";
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
import {TranslateService} from "@ngx-translate/core";
import {AuthService} from "../../services/auth.service";

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
  // @ts-ignore
  @ViewChild("chart") chart: ChartComponent;

  chartOptions: Partial<ChartOptions> | any;

  totalRevue=0
  totalTele=0
  totalCitation=0
  totalArticleUdem=0

  counts$: Observable<any> | undefined;

  annee = new Date().getFullYear()-1

  //variable pour le graphique
  titreGraphique=''
  labelTelechargements=''
  labelUnique=''
  labelRefus=''

  objGraphique$: Observable<any>| undefined;
  objGraphique:any={}
  dataTel=[]
  dataUnique=[]
  dataRefus=[]
  dataTitre=[]

  constructor(private homeService: HomeService,
              private translate:TranslateService) {

  }

  ngOnInit(): void {
    this.getCount();

    this.remplireObjetGraphique()

  }

  async getCount() {
    try {
      this.counts$ = this.homeService.getCount();
      // @ts-ignore
      await this.counts$.toPromise().then(res => {
        console.log(res)
        this.totalRevue=res.totalRevue.toLocaleString()
        this.totalTele=res.totalTele.toLocaleString()
        this.totalCitation=res.totalCitation.toLocaleString()
        this.totalArticleUdem=res.totalArticleUdem.toLocaleString()
      });
    } catch(err) {
      console.error(`Error : ${err.Message}`);
    }
  }
//remplire l'objet pour crée le graphique dynamique
  async remplireObjetGraphique(){
    //recouperer les titres
    this.translate.get('telechargements').subscribe((res: string) => {
      this.labelTelechargements=res;
    });

    this.translate.get('unique-telechargements').subscribe((res: string) => {
      this.labelUnique=res;
    });

    this.translate.get('refus').subscribe((res: string) => {
      this.labelRefus=res;
    });

    this.translate.get('titre-graphique').subscribe((res: string) => {
      this.titreGraphique=res;
    });

    //remplire l'objet
    this.objGraphique$ = this.homeService.getGraphiqueDonnees();
    // @ts-ignore
    await this.objGraphique$.toPromise().then(res => {
      //console.log(res)
      for(let i=0;i<res.length;i++){
        if(res[i].titre)
        { // @ts-ignore
          this.dataTitre.push(res[i].titre)
        }
        if(res[i].Total_Item_Requests)
           { // @ts-ignore
             this.dataTel.push(res[i].Total_Item_Requests.toLocaleString())
           }
        if(res[i].Unique_Item_Requests)
          { // @ts-ignore
            this.dataUnique.push(res[i].Unique_Item_Requests.toLocaleString())
          }
        else { // @ts-ignore
          this.dataUnique.push('0')
        }
        if(res[i].No_License)
        { // @ts-ignore
          this.dataRefus.push(res[i].No_License.toLocaleString())
        }
        else { // @ts-ignore
          this.dataRefus.push('0')
        }
      }
    });

    this.chartOptions = {
      series: [
        {
          name: this.labelTelechargements,
          data: this.dataTel
        },
        {
          name: this.labelUnique,
          data: this.dataUnique
        },
        {
          name: this.labelRefus,
          data: this.dataRefus
        }
      ],
      chart: {
        type: "bar",
        height: 500
      },
      plotOptions: {
        bar: {
          horizontal: true,
          columnWidth: "55%",
          // @ts-ignore
          endingShape: "rounded"
        }
      },
      colors: [
              "#1bdbe0",
              "#0071b9",
              "#ff4d6b"
      ],
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 3,
        colors: ["transparent"]
      },
      xaxis: {
        categories: this.dataTitre
      },
      yaxis: {
        title: {
          text: this.titreGraphique
        }
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: function(val: string) {
            return " " + val + "";
          }
        }
      }
    };
  }
}
