//class qui regroupes les methodes utilisés souvent
import {formatDate} from "@angular/common";
import * as XLSX from "xlsx";

export class MethodesGlobal  {

  //convertir string to int
  private router: any;
  convertNumber(value: string) {
    return parseInt(value);
  }
//prendre la valeur d'un input
  getValue(value:string){
    return value;
  }

  // Déterminer si le checkbox passé en paramètres est a Oui ou pas.
  hasValue(val: string): boolean {
    if (val =='Oui') return true;
    return false;
  }
  // Méthode appelée lorsque l'utilisateur
  checkedInput($event: any): void {
    let checked = $event.target.checked;
    $event.target.value='';
    if (checked) {
      $event.target.value='Oui';
    }
  }

  checkedResult(id:string): boolean {
    // @ts-ignore
    let checked = document.getElementById(id).checked;
    if (checked) {
     return true
    } else return false
  }

  //faire visible un element avec id
  afficher(id:string): void {
    let champ=document.getElementById(id);
    if(champ){
      champ.style.display = 'block';
    }
  }

  //faire invisible un element avec id
  nonAfficher(id:string): void {
    let champ=document.getElementById(id);
    if(champ){
      champ.style.display = 'none';
    }
  }
  //prendre la valeur de ng-select
  getValueNgSelect(val: any):any {
    //console.log("multiselect: ", val);
    return val;
  }
  //Changer l'url lors d'un clique
  async reload(url: string): Promise<boolean> {
    await this.router.navigateByUrl('.', { skipLocationChange: true });
    return this.router.navigateByUrl(url);
  }

  //convertir format date date jj/mm/aaaa to aaaa-mm-jj
  convertDate(dateString:string){
    var splitted = dateString.split("/", 3);
    let newDate=splitted[2]+'-'+splitted[1]+'-'+splitted[0]
      return newDate;
  }
//validation des données dans les champs
  validationDonneesForm(values:any){
    let count=0
    let result =true
    for(let [key,value] of Object.entries(values)){
      // @ts-ignore
      if(value == ''){
        // @ts-ignore
         document.getElementById(key).style.borderColor='red'
         count++
         console.log(key)
      }
      else
        // @ts-ignore
        document.getElementById(key).style.borderColor='#aab2bd'
    }
    if(count>0)
      result=false
    return result
  }
//mask pour l'annees
  mask = {
    "annee":{
      guide: true,
      showMask: true,
      mask: [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/]
    }

  };

  //exporter les données en format xlsx
  async ExportTOExcel(nomTableau:string, nomFile:string)
  {

    setTimeout(async function () {
      let dateNow=new Date().getUTCDate();
      /* table id is passed over here */
      let element = document.getElementById(nomTableau);
      const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);

      /* generate workbook and add the worksheet */
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, nomTableau+dateNow);

      /* save to file */
      XLSX.writeFile(wb, nomFile);
    }, 3000);

    //console.log(this.dataSource);

  }
  //cacher le menu pour non-admin
  ifAdminFunction(): boolean{
    let ifAdmin=sessionStorage.getItem('role');
    if (ifAdmin=='Admin') { return true; }
    else return false
  }

  //Ajouter la valeur pour l'input
  addValueInput(val:string,idInput:string){
    let id_log=document.getElementById(idInput)
    if(id_log)
    { // @ts-ignore
      id_log.value=val
    }
  }

  //creation de la date yyyy-mm-dd H:M:S

  dateCreator(){
    let dateStart = new Date().toLocaleDateString()+' '+new Date().getHours().toLocaleString()+':'+new Date().getUTCMinutes()+':'+new Date().getUTCSeconds()
    //let dateStart =new Date().getFullYear()+'-'+ new Date().getMonth()+'-'+new Date().getDay()+' '+new Date().getHours()+':'+new Date().getMinutes()+':'+new Date().getSeconds();
    return dateStart;
  }
}
