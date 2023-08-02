import {formatDate} from "@angular/common";
import * as XLSX from "xlsx";

export class MethodesGlobal  {

  private router: any;

  // Convertir une chaîne de caractères en nombre entier (int)
  convertNumber(value: string) {
    return parseInt(value);
  }

  // Récupérer la valeur d'une chaîne de caractères (retourne simplement la valeur)
  getValue(value: string){
    return value;
  }

  // Vérifier si la valeur est égale à 'Oui' et retourner un booléen
  hasValue(val: string): boolean {
    return val === 'Oui';
  }

  // Fonction appelée lorsque la case à cocher est cochée (vérifiée)
  checkedInput($event: any): void {
    let checked = $event.target.checked;
    $event.target.value='';
    if (checked) {
      $event.target.value='Oui';
    }
  }

  // Vérifier si la case à cocher (avec l'ID donné en paramètre) est cochée (vérifiée) et retourner un booléen
  checkedResult(id:string): boolean {
    // @ts-ignore
    let checked = document.getElementById(id).checked;
    return checked;
  }

  // Afficher un élément en utilisant son ID (en changeant le style "display" à "block")
  afficher(id:string): void {
    let champ=document.getElementById(id);
    if(champ){
      champ.style.display = 'block';
    }
  }

  // Cacher un élément en utilisant son ID (en changeant le style "display" à "none")
  nonAfficher(id:string): void {
    let champ=document.getElementById(id);
    if(champ){
      champ.style.display = 'none';
    }
  }

  // Récupérer la valeur d'un ng-select (retourne simplement la valeur)
  getValueNgSelect(val: any): any {
    return val;
  }

  // Recharger la page en utilisant l'URL donnée en paramètre
  async reload(url: string): Promise<boolean> {
    await this.router.navigateByUrl('.', { skipLocationChange: true });
    return this.router.navigateByUrl(url);
  }

  // Convertir un format de date de jj/mm/aaaa à aaaa-mm-jj
  convertDate(dateString: string) {
    var splitted = dateString.split("/", 3);
    let newDate = splitted[2] + '-' + splitted[1] + '-' + splitted[0];
    return newDate;
  }

  // Valider les données dans les champs d'un formulaire (changer la bordure des champs vides en rouge)
  validationDonneesForm(values: any) {
    let count = 0;
    let result = true;
    for (let [key,value] of Object.entries(values)) {
      if (value == '') {
        // @ts-ignore
        document.getElementById(key).style.borderColor='red';
        count++;
        console.log(key);
      } else {
        // @ts-ignore
        document.getElementById(key).style.borderColor='#aab2bd';
      }
    }
    if (count > 0) {
      result = false;
    }
    return result;
  }

  // Vérifier si la valeur d'un champ (avec l'ID donné en paramètre) est vide et changer la bordure en rouge si c'est le cas
  isValueChamp(value: string, id: string): boolean {
    let input = document.getElementById(id);
    if (value == '') {
      // @ts-ignore
      input.style.setProperty('border', '1px solid red');
      return false;
    }
    // @ts-ignore
    input.style.setProperty('border', '1px solid #aab2bd');
    return true;
  }

  // Masque pour le format 'année' (utilisé pour un guide dans un champ)
  mask = {
    "annee": {
      guide: true,
      showMask: true,
      mask: [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/]
    }
  };

  // Exporter les données du tableau donné (avec le nom de tableau et le nom de fichier donnés en paramètres) au format xlsx
  async ExportTOExcel(nomTableau: string, nomFile: string) {
    setTimeout(async function () {
      let dateNow = new Date().getUTCDate();
      let element = document.getElementById(nomTableau);
      const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, nomTableau + dateNow);

      XLSX.writeFile(wb, nomFile);
    }, 3000);
  }

  // Vérifier si l'utilisateur est un administrateur (en se basant sur la valeur stockée dans la session)
  ifAdminFunction(): boolean {
    let ifAdmin = sessionStorage.getItem('role');
    return ifAdmin === 'Admin';
  }

  // Ajouter la valeur donnée dans l'input avec l'ID donné en paramètre
  addValueInput(val: string, idInput: string) {
    let id_log = document.getElementById(idInput);
    if (id_log) {
      // @ts-ignore
      id_log.value = val;
    }
  }

  // Créer une date au format yyyy-mm-dd H:M:S
  dateCreator() {
    let dateStart = new Date().toLocaleDateString() + ' ' + new Date().getHours().toLocaleString() + ':' + new Date().getUTCMinutes() + ':' + new Date().getUTCSeconds();
    return dateStart;
  }

  // Retourner '-' si la valeur donnée est null, sinon retourner la valeur elle-même
  returnCharIfNull(val: string) {
    if (!val) {
      val = '-';
    }
    return val.toString();
  }

  // Vider le champ de l'input avec l'ID donné en paramètre (en le remplaçant par une chaîne vide)
  viderInput(id: string) {
    if (id) {
      // @ts-ignore
      document.getElementById(id).value = '';
    }
  }

  // Fonction utilisée pour ajouter une pause dans les opérations (retourne une promesse qui se résout après un certain temps donné en paramètre)
  delay(timeInMillis: number): Promise<void> {
    return new Promise((resolve) => setTimeout(() => resolve(), timeInMillis));
  }


}
