import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'diaEs'
})
export class DiaEsPipe implements PipeTransform {

  private dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  transform(fecha: Date): string {
    const dia = new Date(fecha).getDay();
    const diaNombre = this.dias[dia];
    const diaNum = new Date(fecha).getDate();
    const mesNum = new Date(fecha).getMonth() + 1;
    return `${diaNombre} ${diaNum}/${mesNum}`;
  }

}
